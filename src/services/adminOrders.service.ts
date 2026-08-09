import Decimal from 'decimal.js';
import { apiFetch } from '../api/client';
import { CustomerResultDto, OrderResultDto } from '../api/types';
import {
	AdminOrder,
	AdminOrderSearchParams,
	AdminOrderSearchResult,
	AdminOrdersRealSummary,
} from '../interfaces';

const mapOrder = (dto: OrderResultDto, customer: CustomerResultDto | undefined): AdminOrder => ({
	id: dto.id ?? '',
	customerId: dto.customerId ?? '',
	customerName: customer?.fullName ?? '—',
	customerEmail: customer?.email ?? '',
	sellerId: dto.sellerId ?? null,
	status: (dto.status as AdminOrder['status']) ?? 'Pending',
	totalAmount: dto.totalAmount ?? 0,
	addressLine1: dto.addressLine1 ?? '',
	addressLine2: dto.addressLine2 ?? null,
	city: dto.city ?? '',
	state: dto.state ?? '',
	postalCode: dto.postalCode ?? null,
	country: dto.country ?? '',
	createdAt: dto.createdAt ?? '',
	items: (dto.items ?? []).map(item => ({
		id: item.id ?? '',
		productId: item.productId ?? '',
		productName: item.productName ?? '',
		quantity: item.quantity ?? 0,
		price: item.price ?? 0,
	})),
});

// El backend no expone paginación/búsqueda/filtro en GET /api/order ni
// nombre/email de cliente embebido (a diferencia del esquema Supabase
// anterior) — se trae todo (pedidos + clientes) y se cruza/filtra/pagina en
// el cliente, mismo patrón que adminProducts.service.ts.
const getCustomersById = async (): Promise<Map<string, CustomerResultDto>> => {
	const customers = await apiFetch<CustomerResultDto[]>('/api/customer');
	return new Map(customers.filter(customer => customer.id).map(customer => [customer.id as string, customer]));
};

export const getAdminOrders = async (
	params: AdminOrderSearchParams = {}
): Promise<AdminOrderSearchResult> => {
	const [orders, customersById] = await Promise.all([
		apiFetch<OrderResultDto[]>('/api/order'),
		getCustomersById(),
	]);

	let items = orders
		.slice()
		.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
		.map(order => mapOrder(order, order.customerId ? customersById.get(order.customerId) : undefined));

	if (params.status) items = items.filter(order => order.status === params.status);
	if (params.query) {
		const query = params.query.toLowerCase();
		items = items.filter(
			order => order.id.toLowerCase().includes(query) || order.customerName.toLowerCase().includes(query)
		);
	}

	const total = items.length;
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? 10;
	const from = (page - 1) * pageSize;

	return {
		items: items.slice(from, from + pageSize),
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
};

export const getAdminOrderById = async (id: string): Promise<AdminOrder> => {
	const [order, customersById] = await Promise.all([
		apiFetch<OrderResultDto>(`/api/order/${id}`),
		getCustomersById(),
	]);
	return mapOrder(order, order.customerId ? customersById.get(order.customerId) : undefined);
};

export const updateAdminOrderStatus = async ({ id, status }: { id: string; status: string }): Promise<void> => {
	await apiFetch(`/api/order/${id}/status`, { method: 'PUT', body: { id, status } });
};

// Resumen del Dashboard: no hay endpoint de agregados en el backend real,
// se calcula sobre GET /api/order completo (aceptable a esta escala, mismo
// enfoque que adminProducts.service.ts). Suma con decimal.js, no `number`
// encadenado (regla de dinero del proyecto).
export const getAdminOrdersSummary = async (): Promise<AdminOrdersRealSummary> => {
	const orders = await apiFetch<OrderResultDto[]>('/api/order');

	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

	const ordersToday = orders.filter(order => order.createdAt && new Date(order.createdAt) >= startOfToday).length;
	const monthOrders = orders.filter(order => order.createdAt && new Date(order.createdAt) >= startOfMonth);

	const salesUsdThisMonth = monthOrders
		.reduce((acc, order) => acc.plus(new Decimal(order.totalAmount ?? 0)), new Decimal(0))
		.toDecimalPlaces(2)
		.toNumber();

	const avgTicketUsd =
		monthOrders.length > 0
			? new Decimal(salesUsdThisMonth).dividedBy(monthOrders.length).toDecimalPlaces(2).toNumber()
			: 0;

	return { ordersToday, salesUsdThisMonth, avgTicketUsd };
};
