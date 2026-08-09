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
// únicamente para que la página de confirmación, el rastreo simulado y
// /mi-cuenta/pedidos puedan leerlo después de navegar. Sustituir por
// `createOrder` real (src/actions/order.ts) cuando este checkout se
// conecte al backend.
export interface SimulatedOrder {
	orderNumber: string;
	createdAt: string;
	// Id del usuario autenticado que confirmó el pedido (session.user.id de
	// Supabase Auth), si había sesión activa al momento del checkout. El
	// checkout sigue funcionando sin sesión (invitado); en ese caso queda
	// undefined y el pedido no aparece en /mi-cuenta/pedidos de nadie.
	userId?: string;
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
