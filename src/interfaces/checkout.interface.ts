import { CheckoutFormValues, PaymentMethod } from '../lib/checkoutValidators';

// Snapshot de una línea del carrito en el momento en que se simula el envío
// del pedido (independiente de ICartItem para no acoplar el checkout al
// store de carrito una vez que el pedido ya se "confirmó").
export interface SimulatedOrderItem {
	variantId: string;
	name: string;
	variantLabel: string;
	image: string;
	price: number;
	quantity: number;
	comboName?: string;
}

export interface SimulatedOrderTotals {
	subtotal: number;
	discount: number;
	deliveryCost: number;
	total: number;
}

export type OrderTrackingStage =
	| 'pending_payment'
	| 'confirmed'
	| 'preparing'
	| 'in_transit'
	| 'delivered';

// Pedido "creado" por el checkout simulado. No se envía a Supabase: se
// guarda en localStorage (ver src/services/checkoutSimulation.service.ts)
// únicamente para que la página de confirmación y el rastreo simulado
// puedan leerlo después de navegar. Sustituir por `createOrder` real
// (src/actions/order.ts) cuando este checkout se conecte al backend.
export interface SimulatedOrder {
	orderNumber: string;
	createdAt: string;
	buyer: CheckoutFormValues['buyer'];
	recipient: CheckoutFormValues['recipient'];
	address: CheckoutFormValues['address'];
	location: CheckoutFormValues['location'];
	references: CheckoutFormValues['references'];
	deliveryModality: CheckoutFormValues['delivery']['modality'];
	specialInstructions?: string;
	paymentMethod: PaymentMethod;
	items: SimulatedOrderItem[];
	totals: SimulatedOrderTotals;
}
