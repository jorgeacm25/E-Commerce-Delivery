import Decimal from 'decimal.js';
import { apiFetch } from '../api/client';
import { CustomerResultDto, OrderResultDto } from '../api/types';
import { AdminCustomer, AdminCustomerUpdateInput } from '../interfaces';

// No hay endpoint de "deuda" en el backend — se deriva sumando (decimal.js)
// los pedidos en estado "Pending" de cada cliente, mismo enfoque que
// adminOrders.service.ts para el resumen del dashboard.
export const getAdminCustomers = async (): Promise<AdminCustomer[]> => {
	const [customers, orders] = await Promise.all([
		apiFetch<CustomerResultDto[]>('/api/customer'),
		apiFetch<OrderResultDto[]>('/api/order'),
	]);

	return customers
		.map((customer): AdminCustomer => {
			const customerOrders = orders.filter(order => order.customerId === customer.id);
			const pendingDebtUsd = customerOrders
				.filter(order => order.status === 'Pending')
				.reduce((acc, order) => acc.plus(new Decimal(order.totalAmount ?? 0)), new Decimal(0))
				.toDecimalPlaces(2)
				.toNumber();

			return {
				id: customer.id ?? '',
				fullName: customer.fullName ?? '—',
				email: customer.email ?? '',
				phone: customer.phone ?? '',
				status: customer.status ?? 'active',
				ordersCount: customerOrders.length,
				pendingDebtUsd,
				createdAt: customer.createdAt ?? '',
			};
		})
		.sort((a, b) => b.pendingDebtUsd - a.pendingDebtUsd);
};

export const updateCustomer = async (id: string, input: AdminCustomerUpdateInput): Promise<void> => {
	await apiFetch('/api/customer', { method: 'PUT', body: { id, ...input } });
};

export const deleteCustomer = async (id: string): Promise<void> => {
	await apiFetch(`/api/customer/${id}`, { method: 'DELETE' });
};
