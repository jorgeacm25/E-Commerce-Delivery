import { apiFetch } from '../api/client';
import { CreateOrderInput, OrderResultDto } from '../api/types';
import { CustomerOrder } from '../interfaces';
import { getProvinces } from './adminDeliveryZones.service';

// Checkout público real, contra el backend .NET (api/order) — reemplaza el
// checkout simulado en localStorage (antes checkoutSimulation.service.ts).
// El backend exige un CustomerId autenticado (no hay checkout de invitado,
// ver OrderController.Create) y calcula precio/total server-side a partir
// del ProductEntity vigente — nunca se manda un total desde el cliente.
const mapOrder = (dto: OrderResultDto): CustomerOrder => ({
	id: dto.id ?? '',
	customerId: dto.customerId ?? '',
	status: (dto.status as CustomerOrder['status']) ?? 'Pending',
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

export interface CreateOrderItem {
	productId: string;
	quantity: number;
}

export interface CreateOrderParams {
	customerId: string;
	addressLine1: string;
	addressLine2?: string;
	provinceId: string;
	municipality: string;
	items: CreateOrderItem[];
}

// El formulario guarda la provincia como id (LocationStep, sobre
// api/province real) pero el backend espera el nombre en `state` — se
// resuelve acá contra la misma lista pública que ya usa el selector
// (cacheada por TanStack Query, así que en la práctica no pega dos veces).
export const createOrder = async ({
	customerId,
	addressLine1,
	addressLine2,
	provinceId,
	municipality,
	items,
}: CreateOrderParams): Promise<CustomerOrder> => {
	const provinces = await getProvinces();
	const state = provinces.find(province => province.id === provinceId)?.name ?? '';

	const payload: CreateOrderInput = {
		customerId,
		addressLine1,
		addressLine2: addressLine2 || null,
		city: municipality,
		state,
		country: 'Cuba',
		items,
	};

	const dto = await apiFetch<OrderResultDto>('/api/order', { method: 'POST', body: payload });
	return mapOrder(dto);
};

export const getOrderById = async (id: string): Promise<CustomerOrder> => {
	const dto = await apiFetch<OrderResultDto>(`/api/order/${id}`);
	return mapOrder(dto);
};

export const getOrdersByCustomer = async (customerId: string): Promise<CustomerOrder[]> => {
	const dtos = await apiFetch<OrderResultDto[]>(`/api/order/customer/${customerId}`);
	return dtos
		.map(mapOrder)
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
