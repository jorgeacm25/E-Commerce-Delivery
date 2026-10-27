import { AdminOrderItem, AdminOrderStatus } from './adminOrder.interface';

// Pedido real del checkout público conectado al backend .NET (api/order),
// en reemplazo del pedido simulado en localStorage
// (checkout.interface.ts: SimulatedOrder). Reutiliza los mismos tipos de
// línea/estado que AdminOrder (adminOrder.interface.ts) — misma fuente
// real — pero sin customerName/customerEmail: en la vista del propio
// cliente no hace falta resolverlos contra /api/customer.
export interface CustomerOrder {
	id: string;
	customerId: string;
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

export interface CreateOrderItemInput {
	productId: string;
	quantity: number;
}
