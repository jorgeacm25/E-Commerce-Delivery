// Pedidos reales del panel admin, contra el backend .NET real (`api/order`
// + `api/customer`). Distinto de `OrderWithCustomer`/`OrderInput`
// (order.interface.ts), que siguen sirviendo al área legacy sin enrutar
// (`src/pages/dashboard/`, `src/components/dashboard/orders/`, sobre
// Supabase) — no se tocaron para no romper esos consumidores.
export type AdminOrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface AdminOrderItem {
	id: string;
	productId: string;
	productName: string;
	quantity: number;
	price: number;
}

export interface AdminOrder {
	id: string;
	customerId: string;
	customerName: string;
	customerEmail: string;
	sellerId: string | null;
	status: AdminOrderStatus;
	totalAmount: number;
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	postalCode: string | null;
	country: string;
	createdAt: string;
	items: AdminOrderItem[];
}

export interface AdminOrderSearchParams {
	query?: string;
	status?: AdminOrderStatus;
	page?: number;
	pageSize?: number;
}

export interface AdminOrderSearchResult {
	items: AdminOrder[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface AdminOrdersRealSummary {
	ordersToday: number;
	salesUsdThisMonth: number;
	avgTicketUsd: number;
}
