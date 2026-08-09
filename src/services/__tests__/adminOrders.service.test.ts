import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	getAdminOrderById,
	getAdminOrders,
	getAdminOrdersSummary,
	updateAdminOrderStatus,
} from '../adminOrders.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const customer = { id: 'cust-1', fullName: 'Ana López', email: 'ana@example.com' };

const orderDto = (overrides: Partial<Record<string, unknown>> = {}) => ({
	id: 'order-1',
	customerId: 'cust-1',
	sellerId: null,
	status: 'Pending',
	totalAmount: 25.5,
	addressLine1: 'Calle 1',
	addressLine2: null,
	city: 'La Habana',
	state: 'La Habana',
	postalCode: null,
	country: 'CU',
	createdAt: new Date().toISOString(),
	items: [{ id: 'item-1', productId: 'prod-1', productName: 'Arroz', quantity: 2, price: 6.5 }],
	...overrides,
});

describe('adminOrders.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAdminOrders', () => {
		it('cruza pedidos con clientes y filtra por estado/búsqueda', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/order') return Promise.resolve([orderDto(), orderDto({ id: 'order-2', status: 'Paid' })]);
				if (path === '/api/customer') return Promise.resolve([customer]);
				return Promise.reject(new Error('unexpected path ' + path));
			});

			const result = await getAdminOrders({ status: 'Paid' });

			expect(result.items).toHaveLength(1);
			expect(result.items[0].id).toBe('order-2');
			expect(result.items[0].customerName).toBe('Ana López');
		});

		it('pagina en el cliente', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/order')
					return Promise.resolve(Array.from({ length: 15 }, (_, i) => orderDto({ id: `order-${i}` })));
				if (path === '/api/customer') return Promise.resolve([customer]);
				return Promise.reject(new Error('unexpected path ' + path));
			});

			const result = await getAdminOrders({ page: 2, pageSize: 10 });

			expect(result.items).toHaveLength(5);
			expect(result.totalPages).toBe(2);
		});
	});

	describe('getAdminOrderById', () => {
		it('resuelve el nombre del cliente', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/order/order-1') return Promise.resolve(orderDto());
				if (path === '/api/customer') return Promise.resolve([customer]);
				return Promise.reject(new Error('unexpected path ' + path));
			});

			const result = await getAdminOrderById('order-1');

			expect(result.customerEmail).toBe('ana@example.com');
			expect(result.items[0].productName).toBe('Arroz');
		});
	});

	describe('updateAdminOrderStatus', () => {
		it('llama al endpoint de status con el id en la ruta y el body', async () => {
			apiFetchMock.mockResolvedValue(undefined);

			await updateAdminOrderStatus({ id: 'order-1', status: 'Delivered' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/order/order-1/status', {
				method: 'PUT',
				body: { id: 'order-1', status: 'Delivered' },
			});
		});
	});

	describe('getAdminOrdersSummary', () => {
		it('calcula pedidos de hoy, ventas del mes y ticket promedio', async () => {
			apiFetchMock.mockResolvedValue([orderDto({ totalAmount: 10 }), orderDto({ id: 'order-2', totalAmount: 20 })]);

			const result = await getAdminOrdersSummary();

			expect(result.ordersToday).toBe(2);
			expect(result.salesUsdThisMonth).toBe(30);
			expect(result.avgTicketUsd).toBe(15);
		});
	});
});
