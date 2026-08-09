import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	createSeller,
	getAdminSellers,
	getCommissionsBySeller,
	settleSellerCommissions,
	updateSeller,
} from '../adminSellers.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('adminSellers.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAdminSellers', () => {
		it('combina vendedores y comisiones pendientes para calcular el total por vendedor', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/seller') {
					return Promise.resolve([
						{ id: 's-1', fullName: 'Juan', phone: '555', commissionPercentage: 10, active: true, createdAt: '2026-01-01' },
					]);
				}
				return Promise.resolve([
					{ id: 'c-1', sellerId: 's-1', orderId: 'o-1', amountUsd: 5.5, status: 'Pending', settledAt: null, createdAt: '2026-01-02' },
					{ id: 'c-2', sellerId: 's-1', orderId: 'o-2', amountUsd: 2.25, status: 'Pending', settledAt: null, createdAt: '2026-01-03' },
					{ id: 'c-3', sellerId: 's-1', orderId: 'o-3', amountUsd: 100, status: 'Settled', settledAt: '2026-01-04', createdAt: '2026-01-03' },
				]);
			});

			const result = await getAdminSellers();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/seller');
			expect(apiFetchMock).toHaveBeenCalledWith('/api/commission');
			expect(result).toEqual([
				{
					id: 's-1',
					fullName: 'Juan',
					phone: '555',
					commissionPercentage: 10,
					active: true,
					pendingCommissionUsd: 7.75,
					createdAt: '2026-01-01',
				},
			]);
		});

		it('devuelve comisión pendiente en 0 cuando el vendedor no tiene comisiones', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/seller') {
					return Promise.resolve([
						{ id: 's-1', fullName: 'Juan', phone: '555', commissionPercentage: 10, active: true, createdAt: '2026-01-01' },
					]);
				}
				return Promise.resolve([]);
			});

			const result = await getAdminSellers();

			expect(result[0].pendingCommissionUsd).toBe(0);
		});
	});

	describe('getCommissionsBySeller', () => {
		it('filtra las comisiones por vendedor', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'c-1', sellerId: 's-1', orderId: 'o-1', amountUsd: 5, status: 'Pending', settledAt: null, createdAt: '2026-01-01' },
				{ id: 'c-2', sellerId: 's-2', orderId: 'o-2', amountUsd: 3, status: 'Pending', settledAt: null, createdAt: '2026-01-01' },
			]);

			const result = await getCommissionsBySeller('s-1');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/commission');
			expect(result).toEqual([
				{ id: 'c-1', sellerId: 's-1', orderId: 'o-1', amountUsd: 5, status: 'Pending', settledAt: null, createdAt: '2026-01-01' },
			]);
		});
	});

	describe('createSeller', () => {
		it('crea el vendedor con los datos ingresados', async () => {
			apiFetchMock.mockResolvedValue(null);

			await createSeller({ fullName: 'Juan', phone: '555', commissionPercentage: 10 });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/seller', {
				method: 'POST',
				body: { fullName: 'Juan', phone: '555', commissionPercentage: 10 },
			});
		});
	});

	describe('updateSeller', () => {
		it('actualiza el vendedor incluyendo el id', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updateSeller('s-1', { active: false });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/seller', {
				method: 'PUT',
				body: { id: 's-1', active: false },
			});
		});
	});

	describe('settleSellerCommissions', () => {
		it('liquida las comisiones pendientes del vendedor', async () => {
			apiFetchMock.mockResolvedValue({ settledCount: 2 });

			const result = await settleSellerCommissions('s-1');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/commission/s-1/settle', { method: 'POST' });
			expect(result).toEqual({ settledCount: 2 });
		});
	});
});
