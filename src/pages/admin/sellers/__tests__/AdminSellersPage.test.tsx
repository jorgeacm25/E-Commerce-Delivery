import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminSellers, useManageSellers } from '../../../../hooks';
import { AdminSellersPage } from '../AdminSellersPage';
import { AdminSeller } from '../../../../interfaces';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return { ...actual, useAdminSellers: vi.fn(), useManageSellers: vi.fn() };
});

const useAdminSellersMock = vi.mocked(useAdminSellers);
const useManageSellersMock = vi.mocked(useManageSellers);

const seller: AdminSeller = {
	id: 's-1',
	fullName: 'Juan Pérez',
	phone: '555-1234',
	commissionPercentage: 10,
	active: true,
	pendingCommissionUsd: 15.5,
	createdAt: '2026-01-01',
};

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminSellersPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminSellersPage', () => {
	const create = vi.fn();
	const update = vi.fn();
	const settle = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useAdminSellersMock.mockReturnValue({
			sellers: [seller],
			isLoading: false,
			isError: false,
		});

		useManageSellersMock.mockReturnValue({
			create,
			isCreating: false,
			update,
			isUpdating: false,
			settle,
			isSettling: false,
		});
	});

	it('lista los vendedores existentes con su comisión pendiente', () => {
		renderPage();

		expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
		expect(screen.getByText('10%')).toBeInTheDocument();
		expect(screen.getByText('$15.50')).toBeInTheDocument();
	});

	it('abre el modal y crea un vendedor nuevo', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /nuevo vendedor/i }));

		await user.type(screen.getByLabelText(/^nombre completo\*?$/i), 'Ana López');
		await user.type(screen.getByLabelText(/^teléfono\*?$/i), '555-9999');

		const commissionInput = screen.getByLabelText(/^comisión \(%\)\*?$/i);
		await user.clear(commissionInput);
		await user.type(commissionInput, '15');

		await user.click(screen.getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject({
			fullName: 'Ana López',
			phone: '555-9999',
			commissionPercentage: 15,
		});
	});

	it('pide confirmación antes de liquidar comisiones y llama a settle al confirmar', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /liquidar/i }));

		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getByText('¿Liquidar comisiones pendientes?')).toBeInTheDocument();

		await user.click(within(dialog).getByRole('button', { name: /^liquidar$/i }));

		await waitFor(() => expect(settle).toHaveBeenCalledWith('s-1'));
	});
});
