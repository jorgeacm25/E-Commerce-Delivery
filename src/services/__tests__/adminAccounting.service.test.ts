import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	createExpense,
	deleteExpense,
	getAccountingSummary,
	getLedgerEntries,
	updateExpense,
} from '../adminAccounting.service';
import { LedgerEntry } from '../../interfaces';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('adminAccounting.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getLedgerEntries', () => {
		it('agrega ventas, comisiones liquidadas, remesas y gastos, ordenados de más reciente a más antiguo', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/order') {
					return Promise.resolve([
						{ id: 'order-1', status: 'Delivered', totalAmount: 50, createdAt: '2026-01-01T00:00:00Z' },
						{ id: 'order-2', status: 'Cancelled', totalAmount: 999, createdAt: '2026-01-05T00:00:00Z' },
					]);
				}
				if (path === '/api/commission') {
					return Promise.resolve([
						{ id: 'c-1', sellerId: 'seller-1', amountUsd: 5, status: 'Settled', settledAt: '2026-01-02T00:00:00Z', createdAt: '2026-01-01T00:00:00Z' },
						{ id: 'c-2', sellerId: 'seller-1', amountUsd: 3, status: 'Pending', settledAt: null, createdAt: '2026-01-01T00:00:00Z' },
					]);
				}
				if (path === '/api/remittance') {
					return Promise.resolve([
						{ id: 'r-1', recipientName: 'María', amountUsd: 20, amountCup: 8000, status: 'Sent', notes: null, createdAt: '2026-01-03T00:00:00Z' },
					]);
				}
				if (path === '/api/expense') {
					return Promise.resolve([
						{ id: 'e-1', description: 'Alquiler', amountUsd: 10, amountCup: 4000, category: 'operativo', date: '2026-01-04T00:00:00Z', createdAt: '2026-01-04T00:00:00Z' },
					]);
				}
				return Promise.resolve([]);
			});

			const entries = await getLedgerEntries();

			// solo la venta no cancelada, la comisión liquidada (no la pendiente), la remesa y el gasto
			expect(entries).toHaveLength(4);
			expect(entries.map(e => e.id)).toEqual(['gasto-e-1', 'remesa-r-1', 'comision-c-1', 'venta-order-1']);
			expect(entries.find(e => e.type === 'comision')?.amountUsd).toBe(-5);
			expect(entries.find(e => e.type === 'remesa')?.amountUsd).toBe(-20);
			expect(entries.find(e => e.type === 'gasto')).toMatchObject({
				amountUsd: -10,
				sourceId: 'e-1',
				amountCup: 4000,
				category: 'operativo',
			});
		});

		it('excluye comisiones pendientes del libro contable', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/commission') {
					return Promise.resolve([
						{ id: 'c-1', sellerId: 'seller-1', amountUsd: 5, status: 'Pending', settledAt: null, createdAt: '2026-01-01T00:00:00Z' },
					]);
				}
				return Promise.resolve([]);
			});

			const entries = await getLedgerEntries();

			expect(entries).toEqual([]);
		});
	});

	describe('getAccountingSummary', () => {
		it('calcula ventas, gastos y balance neto en base decimal', () => {
			const entries: LedgerEntry[] = [
				{ id: 'venta-1', type: 'venta', description: 'Pedido #1', amountUsd: 100, date: '2026-01-01' },
				{ id: 'comision-1', type: 'comision', description: 'Comisión', amountUsd: -10, date: '2026-01-01' },
				{ id: 'remesa-1', type: 'remesa', description: 'Remesa', amountUsd: -20, date: '2026-01-01' },
				{ id: 'gasto-1', type: 'gasto', description: 'Gasto', amountUsd: -5.5, date: '2026-01-01', sourceId: 'e-1' },
			];

			const summary = getAccountingSummary(entries);

			expect(summary).toEqual({
				salesUsd: 100,
				settledCommissionsUsd: 10,
				remittancesUsd: 20,
				expensesUsd: 5.5,
				balanceUsd: 64.5,
			});
		});

		it('devuelve todo en 0 cuando no hay movimientos', () => {
			const summary = getAccountingSummary([]);

			expect(summary).toEqual({
				salesUsd: 0,
				settledCommissionsUsd: 0,
				remittancesUsd: 0,
				expensesUsd: 0,
				balanceUsd: 0,
			});
		});
	});

	describe('createExpense', () => {
		it('crea el gasto convirtiendo la fecha a ISO datetime', async () => {
			apiFetchMock.mockResolvedValue(null);

			await createExpense({ description: 'Alquiler', amountUsd: 10, amountCup: 4000, category: 'operativo', date: '2026-01-04' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/expense', {
				method: 'POST',
				body: expect.objectContaining({
					description: 'Alquiler',
					amountUsd: 10,
					amountCup: 4000,
					category: 'operativo',
					date: new Date('2026-01-04').toISOString(),
				}),
			});
		});
	});

	describe('updateExpense', () => {
		it('actualiza el gasto incluyendo el id', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updateExpense('e-1', { description: 'Alquiler oficina' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/expense', {
				method: 'PUT',
				body: { id: 'e-1', description: 'Alquiler oficina', date: undefined },
			});
		});
	});

	describe('deleteExpense', () => {
		it('elimina el gasto por id', async () => {
			apiFetchMock.mockResolvedValue(null);

			await deleteExpense('e-1');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/expense/e-1', { method: 'DELETE' });
		});
	});
});
