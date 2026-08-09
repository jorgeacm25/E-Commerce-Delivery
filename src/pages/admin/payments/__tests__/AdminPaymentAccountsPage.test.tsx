import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useManagePaymentAccounts, usePaymentAccounts } from '../../../../hooks';
import { AdminPaymentAccountsPage } from '../AdminPaymentAccountsPage';
import { AdminPaymentAccount } from '../../../../interfaces';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return { ...actual, usePaymentAccounts: vi.fn(), useManagePaymentAccounts: vi.fn() };
});

const usePaymentAccountsMock = vi.mocked(usePaymentAccounts);
const useManagePaymentAccountsMock = vi.mocked(useManagePaymentAccounts);

const account: AdminPaymentAccount = {
	id: 'a-1',
	tipo: 'zelle',
	titular: 'Tienda Demo',
	referencia: 'tienda@zelle.com',
	activa: true,
	prioridad: 1,
	createdAt: '2026-01-01',
};

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminPaymentAccountsPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminPaymentAccountsPage', () => {
	const create = vi.fn();
	const setActive = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		usePaymentAccountsMock.mockReturnValue({
			accounts: [account],
			isLoading: false,
			isError: false,
		});

		useManagePaymentAccountsMock.mockReturnValue({
			create,
			isCreating: false,
			update: vi.fn(),
			isUpdating: false,
			setActive,
			isSettingActive: false,
		});
	});

	it('lista las cuentas de cobro existentes', () => {
		renderPage();

		expect(screen.getByText('Tienda Demo')).toBeInTheDocument();
		expect(screen.getByText('tienda@zelle.com')).toBeInTheDocument();
		expect(screen.getByText('Activa')).toBeInTheDocument();
	});

	it('abre el modal y crea una cuenta de cobro nueva', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /nueva cuenta/i }));

		await user.selectOptions(screen.getByLabelText(/^tipo\*?$/i), 'paypal');
		await user.type(screen.getByLabelText(/^titular\*?$/i), 'Tienda Nueva');
		await user.type(screen.getByLabelText(/^referencia\*?$/i), 'nueva@paypal.com');

		await user.click(screen.getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject({
			tipo: 'paypal',
			titular: 'Tienda Nueva',
			referencia: 'nueva@paypal.com',
		});
	});

	it('activa o desactiva una cuenta con el switch, sin pedir confirmación', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('switch'));

		expect(setActive).toHaveBeenCalledWith({ id: 'a-1', activa: false });
	});
});
