import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLedgerEntries, useManageExpenses } from '../../../../hooks';
import { AdminAccountingPage } from '../AdminAccountingPage';
import { LedgerEntry } from '../../../../interfaces';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return { ...actual, useLedgerEntries: vi.fn(), useManageExpenses: vi.fn() };
});

const useLedgerEntriesMock = vi.mocked(useLedgerEntries);
const useManageExpensesMock = vi.mocked(useManageExpenses);

const saleEntry: LedgerEntry = {
	id: 'venta-order-1',
	type: 'venta',
	description: 'Pedido #order-1',
	amountUsd: 50,
	date: '2026-01-01T00:00:00Z',
};

const expenseEntry: LedgerEntry = {
	id: 'gasto-e-1',
	type: 'gasto',
	description: 'Alquiler',
	amountUsd: -10,
	date: '2026-01-02T00:00:00Z',
	sourceId: 'e-1',
	amountCup: 4000,
	category: 'operativo',
};

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminAccountingPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminAccountingPage', () => {
	const create = vi.fn();
	const update = vi.fn();
	const remove = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useLedgerEntriesMock.mockReturnValue({
			entries: [saleEntry, expenseEntry],
			summary: {
				salesUsd: 50,
				settledCommissionsUsd: 0,
				remittancesUsd: 0,
				expensesUsd: 10,
				balanceUsd: 40,
			},
			isLoading: false,
			isError: false,
		});

		useManageExpensesMock.mockReturnValue({
			create,
			isCreating: false,
			update,
			isUpdating: false,
			remove,
			isDeleting: false,
		});
	});

	it('lista los movimientos y solo muestra acciones de editar/eliminar en los gastos', () => {
		renderPage();

		expect(screen.getByText('Pedido #order-1')).toBeInTheDocument();
		expect(screen.getByText('Alquiler')).toBeInTheDocument();
		// Solo hay una fila de tipo "gasto", así que solo debe haber un botón editar/eliminar.
		expect(screen.getAllByRole('button', { name: /^editar$/i })).toHaveLength(1);
		expect(screen.getAllByRole('button', { name: /^eliminar$/i })).toHaveLength(1);
	});

	it('abre el modal y registra un gasto nuevo', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /registrar gasto/i }));

		const dialog = screen.getByRole('dialog');
		await user.type(within(dialog).getByLabelText(/^descripción\*?$/i), 'Transporte');
		await user.type(within(dialog).getByLabelText(/^categoría\*?$/i), 'logística');

		await user.click(within(dialog).getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject({
			description: 'Transporte',
			category: 'logística',
		});
	});

	it('abre el modal de edición precargado con los datos del gasto y guarda los cambios', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /^editar$/i }));

		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getByDisplayValue('Alquiler')).toBeInTheDocument();

		const descriptionInput = within(dialog).getByLabelText(/^descripción\*?$/i);
		await user.clear(descriptionInput);
		await user.type(descriptionInput, 'Alquiler local');

		await user.click(within(dialog).getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
		expect(update.mock.calls[0][0]).toMatchObject({
			id: 'e-1',
			input: expect.objectContaining({ description: 'Alquiler local' }),
		});
	});

	it('pide confirmación antes de eliminar un gasto y llama a remove con el sourceId', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

		const confirmDialog = screen.getByRole('dialog');
		expect(within(confirmDialog).getByText('¿Eliminar este gasto?')).toBeInTheDocument();

		await user.click(within(confirmDialog).getByRole('button', { name: /^eliminar$/i }));

		await waitFor(() => expect(remove).toHaveBeenCalledWith('e-1'));
	});
});
