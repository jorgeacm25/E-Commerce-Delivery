import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminRemittances, useManageRemittances } from '../../../../hooks';
import { AdminRemittancesPage } from '../AdminRemittancesPage';
import { AdminRemittance } from '../../../../interfaces';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return { ...actual, useAdminRemittances: vi.fn(), useManageRemittances: vi.fn() };
});

const useAdminRemittancesMock = vi.mocked(useAdminRemittances);
const useManageRemittancesMock = vi.mocked(useManageRemittances);

const remittance: AdminRemittance = {
	id: 'r-1',
	customerId: null,
	recipientName: 'María González',
	amountUsd: 50,
	amountCup: 20000,
	status: 'Pending',
	notes: null,
	createdAt: '2026-01-01T00:00:00Z',
};

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminRemittancesPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminRemittancesPage', () => {
	const create = vi.fn();
	const updateStatus = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useAdminRemittancesMock.mockReturnValue({
			remittances: [remittance],
			isLoading: false,
			isError: false,
		});

		useManageRemittancesMock.mockReturnValue({
			create,
			isCreating: false,
			updateStatus,
			isUpdatingStatus: false,
		});
	});

	it('lista las remesas existentes', () => {
		renderPage();

		expect(screen.getByText('María González')).toBeInTheDocument();
		expect(screen.getByText('$50.00')).toBeInTheDocument();
		expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
	});

	it('abre el modal y crea una remesa nueva', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /nueva remesa/i }));

		await user.type(screen.getByLabelText(/^destinatario\*?$/i), 'Ana Pérez');

		const usdInput = screen.getByLabelText(/^monto \(usd\)\*?$/i);
		await user.clear(usdInput);
		await user.type(usdInput, '75');

		await user.click(screen.getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject({
			recipientName: 'Ana Pérez',
			amountUsd: 75,
		});
	});

	it('cambia el estado de la remesa desde el selector de la fila', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.selectOptions(screen.getByLabelText(/cambiar estado de la remesa/i), 'Sent');

		expect(updateStatus).toHaveBeenCalledWith({ id: 'r-1', status: 'Sent' });
	});
});
