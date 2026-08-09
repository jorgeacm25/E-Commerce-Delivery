import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminCustomers, useManageCustomers } from '../../../../hooks';
import { AdminCustomersPage } from '../AdminCustomersPage';
import { AdminCustomer } from '../../../../interfaces';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return { ...actual, useAdminCustomers: vi.fn(), useManageCustomers: vi.fn() };
});

const useAdminCustomersMock = vi.mocked(useAdminCustomers);
const useManageCustomersMock = vi.mocked(useManageCustomers);

const customers: AdminCustomer[] = [
	{
		id: 'c-1',
		fullName: 'Ana López',
		email: 'ana@test.com',
		phone: '555-1111',
		status: 'active',
		ordersCount: 3,
		pendingDebtUsd: 15.5,
		createdAt: '2026-01-01',
	},
	{
		id: 'c-2',
		fullName: 'Beto Ruiz',
		email: 'beto@test.com',
		phone: '555-2222',
		status: 'active',
		ordersCount: 1,
		pendingDebtUsd: 0,
		createdAt: '2026-01-01',
	},
];

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminCustomersPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminCustomersPage', () => {
	const update = vi.fn();
	const remove = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useAdminCustomersMock.mockReturnValue({
			customers,
			isLoading: false,
			isError: false,
		});

		useManageCustomersMock.mockReturnValue({
			update,
			isUpdating: false,
			remove,
			isDeleting: false,
		});
	});

	it('lista los clientes con su deuda pendiente', () => {
		renderPage();

		expect(screen.getByText('Ana López')).toBeInTheDocument();
		expect(screen.getByText('Beto Ruiz')).toBeInTheDocument();
		expect(screen.getByText('$15.50')).toBeInTheDocument();
		expect(screen.getByText('Sin deuda')).toBeInTheDocument();
	});

	it('filtra los clientes por nombre o correo', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByPlaceholderText(/buscar por nombre o correo/i), 'beto');

		expect(screen.queryByText('Ana López')).not.toBeInTheDocument();
		expect(screen.getByText('Beto Ruiz')).toBeInTheDocument();
	});

	it('abre el modal de edición y guarda los cambios del cliente', async () => {
		const user = userEvent.setup();
		renderPage();

		const [firstEditButton] = screen.getAllByRole('button', { name: /editar/i });
		await user.click(firstEditButton);

		const nameInput = screen.getByLabelText(/^nombre completo\*?$/i);
		await user.clear(nameInput);
		await user.type(nameInput, 'Ana López García');

		await user.click(screen.getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		expect(update.mock.calls[0][0]).toMatchObject({
			id: 'c-1',
			input: expect.objectContaining({ fullName: 'Ana López García' }),
		});
	});

	it('pide confirmación antes de eliminar y llama a remove al confirmar', async () => {
		const user = userEvent.setup();
		renderPage();

		const [firstDeleteButton] = screen.getAllByRole('button', { name: /eliminar/i });
		await user.click(firstDeleteButton);

		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getByText('¿Eliminar este cliente?')).toBeInTheDocument();

		await user.click(within(dialog).getByRole('button', { name: /^eliminar$/i }));

		await waitFor(() => expect(remove).toHaveBeenCalledWith('c-1'));
	});
});
