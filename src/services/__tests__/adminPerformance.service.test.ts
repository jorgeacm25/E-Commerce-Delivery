import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getPerformanceSummary } from '../adminPerformance.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const ordersFixture = [
	{
		id: 'o-1',
		status: 'Delivered',
		totalAmount: 30,
		items: [
			{ productId: 'p-1', productName: 'Arroz', quantity: 2, price: 10 },
			{ productId: 'p-2', productName: 'Frijoles', quantity: 1, price: 10 },
		],
	},
	{
		id: 'o-2',
		status: 'Paid',
		totalAmount: 20,
		items: [{ productId: 'p-1', productName: 'Arroz', quantity: 1, price: 10 }],
	},
	{
		id: 'o-3',
		status: 'Cancelled',
		totalAmount: 999,
		items: [{ productId: 'p-1', productName: 'Arroz', quantity: 50, price: 10 }],
	},
];

const sellersFixture = [{ id: 's-1', fullName: 'Juan', phone: '555', commissionPercentage: 10, active: true, createdAt: '2026-01-01' }];

const commissionsFixture = [
	{ id: 'c-1', sellerId: 's-1', orderId: 'o-1', amountUsd: 3, status: 'Settled', settledAt: '2026-01-02', createdAt: '2026-01-01' },
	{ id: 'c-2', sellerId: 's-1', orderId: 'o-2', amountUsd: 2, status: 'Pending', settledAt: null, createdAt: '2026-01-01' },
];

describe('adminPerformance.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		apiFetchMock.mockImplementation((path: string) => {
			if (path === '/api/order') return Promise.resolve(ordersFixture);
			if (path === '/api/seller') return Promise.resolve(sellersFixture);
			if (path === '/api/commission') return Promise.resolve(commissionsFixture);
			return Promise.resolve([]);
		});
	});

	describe('getPerformanceSummary', () => {
		it('excluye pedidos cancelados del total de ventas y calcula el ticket promedio', async () => {
			const summary = await getPerformanceSummary();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/order');
			expect(summary.totalOrders).toBe(2);
			expect(summary.totalSalesUsd).toBe(50);
			expect(summary.avgTicketUsd).toBe(25);
		});

		it('agrega los productos más vendidos por cantidad, ignorando pedidos cancelados', async () => {
			const summary = await getPerformanceSummary();

			expect(summary.topProducts).toEqual([
				{ productId: 'p-1', productName: 'Arroz', quantitySold: 3, revenueUsd: 30 },
				{ productId: 'p-2', productName: 'Frijoles', quantitySold: 1, revenueUsd: 10 },
			]);
		});

		it('calcula la comisión total, liquidada y pendiente por vendedor', async () => {
			const summary = await getPerformanceSummary();

			expect(summary.sellerPerformance).toEqual([
				{
					sellerId: 's-1',
					fullName: 'Juan',
					totalCommissionUsd: 5,
					pendingCommissionUsd: 2,
					settledCommissionUsd: 3,
				},
			]);
		});

		it('devuelve un resumen vacío cuando no hay pedidos ni vendedores', async () => {
			apiFetchMock.mockImplementation(() => Promise.resolve([]));

			const summary = await getPerformanceSummary();

			expect(summary).toEqual({
				totalSalesUsd: 0,
				totalOrders: 0,
				avgTicketUsd: 0,
				topProducts: [],
				sellerPerformance: [],
			});
		});
	});
});
