import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminWorkers, useManageWorkers } from '../../../../hooks';
import { AdminWorkersPage } from '../AdminWorkersPage';
import { AdminWorker } from '../../../../interfaces';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return { ...actual, useAdminWorkers: vi.fn(), useManageWorkers: vi.fn() };
});

const useAdminWorkersMock = vi.mocked(useAdminWorkers);
const useManageWorkersMock = vi.mocked(useManageWorkers);

const worker: AdminWorker = {
	id: 'w-1',
	fullName: 'Pedro Gómez',
	role: 'Repartidor',
	active: true,
	pendingAmountUsd: 12,
	createdAt: '2026-01-01',
};

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminWorkersPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminWorkersPage', () => {
	const create = vi.fn();
	const update = vi.fn();
	const settle = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useAdminWorkersMock.mockReturnValue({
			workers: [worker],
			isLoading: false,
			isError: false,
		});

		useManageWorkersMock.mockReturnValue({
			create,
			isCreating: false,
			update,
			isUpdating: false,
			settle,
			isSettling: false,
		});
	});

	it('lista los trabajadores existentes con su pago pendiente', () => {
		renderPage();

		expect(screen.getByText('Pedro Gómez')).toBeInTheDocument();
		expect(screen.getByText('Repartidor')).toBeInTheDocument();
		expect(screen.getByText('$12.00')).toBeInTheDocument();
	});

	it('abre el modal y crea un trabajador nuevo', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /nuevo trabajador/i }));

		await user.type(screen.getByLabelText(/^nombre completo\*?$/i), 'Luis Díaz');

		const roleInput = screen.getByLabelText(/^rol\*?$/i);
		await user.clear(roleInput);
		await user.type(roleInput, 'Almacén');

		await user.click(screen.getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject({
			fullName: 'Luis Díaz',
			role: 'Almacén',
		});
	});

	it('pide confirmación antes de liquidar el pago pendiente y llama a settle al confirmar', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /liquidar/i }));

		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getByText('¿Liquidar pago pendiente?')).toBeInTheDocument();

		await user.click(within(dialog).getByRole('button', { name: /^liquidar$/i }));

		await waitFor(() => expect(settle).toHaveBeenCalledWith('w-1'));
	});
});
