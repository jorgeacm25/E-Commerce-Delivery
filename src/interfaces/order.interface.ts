// No hay `check` constraint en la columna `orders.status` en la base de
// datos (ver supabase/migrations/000_base_schema.sql) — esta unión es la
// única fuente de verdad del lado del cliente.
export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderInput {
	address: {
		addressLine1: string;
		addressLine2?: string;
		city: string;
		state: string;
		postalCode?: string;
		country: string;
	};
	cartItems: {
		variantId: string;
		quantity: number;
		price: number;
	}[];
	totalAmount: number;
}

export interface OrderItemSingle {
	created_at: string;
	id: number;
	status: string;
	total_amount: number;
}

export interface OrderWithCustomer {
	id: number;
	status: string;
	total_amount: number;
	created_at: string;
	customers: {
		full_name: string;
		email: string;
	} | null;
}

export interface AdminOrdersSearchParams {
	page?: number;
	pageSize?: number;
	status?: OrderStatus;
	search?: string;
}

export interface AdminOrdersSearchResult {
	orders: OrderWithCustomer[];
	count: number;
}

export interface AdminOrdersSummary {
	ordersToday: number;
	salesUsdThisMonth: number;
	avgTicketUsd: number;
}
