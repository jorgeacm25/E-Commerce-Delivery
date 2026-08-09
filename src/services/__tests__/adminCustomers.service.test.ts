import { describe, expect, it, vi, beforeEach } from 'vitest';
import { deleteCustomer, getAdminCustomers, updateCustomer } from '../adminCustomers.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('adminCustomers.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAdminCustomers', () => {
		it('deriva la deuda pendiente sumando los pedidos en estado Pending y ordena por deuda descendente', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/customer') {
					return Promise.resolve([
						{ id: 'c-1', fullName: 'Ana', email: 'ana@test.com', phone: '555', status: 'active', createdAt: '2026-01-01' },
						{ id: 'c-2', fullName: 'Beto', email: 'beto@test.com', phone: '555', status: 'active', createdAt: '2026-01-01' },
					]);
				}
				return Promise.resolve([
					{ id: 'o-1', customerId: 'c-1', status: 'Pending', totalAmount: 10 },
					{ id: 'o-2', customerId: 'c-1', status: 'Pending', totalAmount: 5.5 },
					{ id: 'o-3', customerId: 'c-1', status: 'Delivered', totalAmount: 100 },
					{ id: 'o-4', customerId: 'c-2', status: 'Delivered', totalAmount: 20 },
				]);
			});

			const result = await getAdminCustomers();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/customer');
			expect(apiFetchMock).toHaveBeenCalledWith('/api/order');
			expect(result).toEqual([
				{
					id: 'c-1',
					fullName: 'Ana',
					email: 'ana@test.com',
					phone: '555',
					status: 'active',
					ordersCount: 3,
					pendingDebtUsd: 15.5,
					createdAt: '2026-01-01',
				},
				{
					id: 'c-2',
					fullName: 'Beto',
					email: 'beto@test.com',
					phone: '555',
					status: 'active',
					ordersCount: 1,
					pendingDebtUsd: 0,
					createdAt: '2026-01-01',
				},
			]);
		});

		it('devuelve deuda 0 y 0 pedidos para un cliente sin pedidos', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/customer') {
					return Promise.resolve([{ id: 'c-1', fullName: 'Ana', email: 'ana@test.com', phone: '555', status: 'active', createdAt: '2026-01-01' }]);
				}
				return Promise.resolve([]);
			});

			const result = await getAdminCustomers();

			expect(result[0].ordersCount).toBe(0);
			expect(result[0].pendingDebtUsd).toBe(0);
		});
	});

	describe('updateCustomer', () => {
		it('actualiza el cliente con PUT /api/customer', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updateCustomer('c-1', { fullName: 'Ana López', phone: '555-9999' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/customer', {
				method: 'PUT',
				body: { id: 'c-1', fullName: 'Ana López', phone: '555-9999' },
			});
		});
	});

	describe('deleteCustomer', () => {
		it('elimina el cliente con DELETE /api/customer/{id}', async () => {
			apiFetchMock.mockResolvedValue(null);

			await deleteCustomer('c-1');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/customer/c-1', { method: 'DELETE' });
		});
	});
});
