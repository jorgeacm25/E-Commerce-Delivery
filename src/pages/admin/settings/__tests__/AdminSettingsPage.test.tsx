import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useActiveAgencyContact,
	useActiveExchangeRate,
	useAdminAccounts,
	useAuth,
	useManageAdminAccounts,
	useUpdateAgencyContact,
	useUpdateExchangeRate,
} from '../../../../hooks';
import { AdminSettingsPage } from '../AdminSettingsPage';
import { AdminAccount, Profile } from '../../../../interfaces';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return {
		...actual,
		useActiveExchangeRate: vi.fn(),
		useUpdateExchangeRate: vi.fn(),
		useActiveAgencyContact: vi.fn(),
		useUpdateAgencyContact: vi.fn(),
		useAuth: vi.fn(),
		useAdminAccounts: vi.fn(),
		useManageAdminAccounts: vi.fn(),
	};
});

const useActiveExchangeRateMock = vi.mocked(useActiveExchangeRate);
const useUpdateExchangeRateMock = vi.mocked(useUpdateExchangeRate);
const useActiveAgencyContactMock = vi.mocked(useActiveAgencyContact);
const useUpdateAgencyContactMock = vi.mocked(useUpdateAgencyContact);
const useAuthMock = vi.mocked(useAuth);
const useAdminAccountsMock = vi.mocked(useAdminAccounts);
const useManageAdminAccountsMock = vi.mocked(useManageAdminAccounts);

const selfProfile: Profile = {
	id: 'admin-self',
	fullName: 'Yo Mismo',
	phone: null,
	role: 'staff',
	status: 'active',
	createdAt: null,
	updatedAt: null,
	accountType: 'admin',
};

const otherAccount: AdminAccount = {
	id: 'admin-other',
	fullName: 'Otro Admin',
	userName: 'otro',
	accountType: 'admin',
	createdAt: '2026-01-01T00:00:00Z',
	updatedAt: null,
};

const selfAccount: AdminAccount = {
	id: 'admin-self',
	fullName: 'Yo Mismo',
	userName: 'yo',
	accountType: 'admin',
	createdAt: '2026-01-02T00:00:00Z',
	updatedAt: null,
};

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminSettingsPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminSettingsPage - Administradores y staff', () => {
	const create = vi.fn();
	const resetPassword = vi.fn();
	const remove = vi.fn();
	const updateContact = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useActiveExchangeRateMock.mockReturnValue({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data: { valor_cup_por_usd: 400, vigente_desde: '2026-01-01T00:00:00Z' } as any,
			isLoading: false,
		});

		useUpdateExchangeRateMock.mockReturnValue({ mutate: vi.fn(), isPending: false });

		useActiveAgencyContactMock.mockReturnValue({
			contact: { id: 'contact-1', whatsappPhone: '+53 5555 5555', vigenteDesde: '2026-01-01T00:00:00Z', creadoPorAdminId: null },
			isLoading: false,
		});

		useUpdateAgencyContactMock.mockReturnValue({ mutate: updateContact, isPending: false });

		useAuthMock.mockReturnValue({
			session: null,
			user: null,
			profile: selfProfile,
			isInitializing: false,
			isProfileLoading: false,
			signUp: vi.fn(),
			signIn: vi.fn(),
			staffSignIn: vi.fn(),
			signOut: vi.fn(),
			requestPasswordReset: vi.fn(),
			resetPassword: vi.fn(),
			updatePassword: vi.fn(),
		});

		useAdminAccountsMock.mockReturnValue({
			accounts: [selfAccount, otherAccount],
			isLoading: false,
			isError: false,
		});

		useManageAdminAccountsMock.mockReturnValue({
			create,
			isCreating: false,
			resetPassword,
			isResettingPassword: false,
			remove,
			isDeleting: false,
		});
	});

	it('lista las cuentas de administradores y staff', () => {
		renderPage();

		expect(screen.getByText('Yo Mismo')).toBeInTheDocument();
		expect(screen.getByText('Otro Admin')).toBeInTheDocument();
	});

	it('muestra el WhatsApp vigente y actualiza uno nuevo', async () => {
		const user = userEvent.setup();
		renderPage();

		expect(screen.getByText(/vigente: \+53 5555 5555/i)).toBeInTheDocument();

		await user.type(screen.getByLabelText(/^whatsapp\*?$/i), '+53 5555 9999');
		await user.click(screen.getByRole('button', { name: /^actualizar$/i }));

		await waitFor(() => expect(updateContact).toHaveBeenCalledWith('+53 5555 9999', expect.any(Object)));
	});

	it('deshabilita editar y eliminar en la fila del propio usuario logueado', () => {
		renderPage();

		const selfRow = screen.getByText('Yo Mismo').closest('tr');
		expect(selfRow).not.toBeNull();
		const selfButtons = within(selfRow as HTMLElement).getAllByRole('button');
		selfButtons.forEach(button => expect(button).toBeDisabled());

		const otherRow = screen.getByText('Otro Admin').closest('tr');
		const otherButtons = within(otherRow as HTMLElement).getAllByRole('button');
		otherButtons.forEach(button => expect(button).toBeEnabled());
	});

	it('abre el modal de restablecer contraseña para una cuenta que no es la propia y guarda', async () => {
		const user = userEvent.setup();
		renderPage();

		const otherRow = screen.getByText('Otro Admin').closest('tr') as HTMLElement;
		await user.click(within(otherRow).getByRole('button', { name: /contraseña/i }));

		const dialog = screen.getByRole('dialog');
		await user.type(within(dialog).getByLabelText(/^nueva contraseña\*?$/i), 'nuevaClave123');
		await user.click(within(dialog).getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(resetPassword).toHaveBeenCalledTimes(1));
		expect(resetPassword.mock.calls[0][0]).toMatchObject({
			id: 'admin-other',
			accountType: 'admin',
			password: 'nuevaClave123',
		});
	});

	it('pide confirmación antes de eliminar una cuenta que no es la propia', async () => {
		const user = userEvent.setup();
		renderPage();

		const otherRow = screen.getByText('Otro Admin').closest('tr') as HTMLElement;
		await user.click(within(otherRow).getByRole('button', { name: /eliminar/i }));

		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getByText('¿Eliminar esta cuenta?')).toBeInTheDocument();

		await user.click(within(dialog).getByRole('button', { name: /^eliminar$/i }));

		await waitFor(() =>
			expect(remove).toHaveBeenCalledWith({ id: 'admin-other', accountType: 'admin' })
		);
	});
});
