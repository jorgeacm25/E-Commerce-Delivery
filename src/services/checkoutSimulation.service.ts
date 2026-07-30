import { CheckoutFormValues, PaymentMethod } from '../lib/checkoutValidators';
import { OrderTrackingStage, SimulatedOrder, SimulatedOrderItem, SimulatedOrderTotals } from '../interfaces';

// Checkout 100% simulado en el cliente (ver CLAUDE.md: "no integrar todavía
// procesadores de pago reales"). No hay llamada a Supabase: el pedido se
// guarda en localStorage solo para que /pedido-confirmado/:orderNumber y
// /rastrear-pedido puedan leerlo después de navegar. Reemplazar por
// `createOrder` (src/actions/order.ts) cuando este checkout se conecte al
// backend real.
const STORAGE_KEY = 'dh-simulated-orders';

// Umbrales cortos (segundos, no días) a propósito: es una simulación de
// demostración, no un cálculo de logística real, y así se puede ver el
// avance del rastreo dentro de la misma sesión de prueba.
const TRACKING_THRESHOLDS_MS: [OrderTrackingStage, number][] = [
	['pending_payment', 20_000],
	['confirmed', 45_000],
	['preparing', 80_000],
	['in_transit', 130_000],
	['delivered', Infinity],
];

export const ORDER_TRACKING_STAGE_LABELS: Record<OrderTrackingStage, string> = {
	pending_payment: 'Pago pendiente de confirmación',
	confirmed: 'Pedido confirmado',
	preparing: 'Preparando tu pedido',
	in_transit: 'En camino al destinatario',
	delivered: 'Entregado',
};

export const ORDER_TRACKING_STAGE_ORDER: OrderTrackingStage[] = [
	'pending_payment',
	'confirmed',
	'preparing',
	'in_transit',
	'delivered',
];

const readAllOrders = (): Record<string, SimulatedOrder> => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed: unknown = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? (parsed as Record<string, SimulatedOrder>) : {};
	} catch {
		return {};
	}
};

const writeAllOrders = (orders: Record<string, SimulatedOrder>) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

const generateOrderNumber = (existing: Record<string, SimulatedOrder>): string => {
	let candidate: string;

	do {
		const digits = Math.floor(100000 + Math.random() * 900000);
		candidate = `DH-${digits}`;
	} while (candidate in existing);

	return candidate;
};

const simulateNetworkDelay = (delayMs = 1100): Promise<void> =>
	new Promise(resolve => {
		setTimeout(resolve, delayMs);
	});

export interface SubmitSimulatedOrderInput {
	form: CheckoutFormValues;
	items: SimulatedOrderItem[];
	totals: SimulatedOrderTotals;
}

// Simula el envío del pedido + "pago" (nunca captura datos de tarjeta real,
// ver PaymentStep). Falla al azar una fracción de las veces para poder
// ejercitar el manejo de errores del wizard sin depender de un backend.
export const submitSimulatedOrder = async ({
	form,
	items,
	totals,
}: SubmitSimulatedOrderInput): Promise<SimulatedOrder> => {
	await simulateNetworkDelay();

	if (Math.random() < 0.12) {
		throw new Error('No pudimos confirmar el pago simulado. Verifica los datos e inténtalo de nuevo.');
	}

	const orders = readAllOrders();
	const orderNumber = generateOrderNumber(orders);

	const order: SimulatedOrder = {
		orderNumber,
		createdAt: new Date().toISOString(),
		buyer: form.buyer,
		recipient: form.recipient,
		address: form.address,
		location: form.location,
		references: form.references,
		deliveryModality: form.delivery.modality,
		specialInstructions: form.instructions.specialInstructions || undefined,
		paymentMethod: form.payment.method as PaymentMethod,
		items,
		totals,
	};

	orders[orderNumber] = order;
	writeAllOrders(orders);

	return order;
};

export const getSimulatedOrder = (orderNumber: string): SimulatedOrder | null => {
	const orders = readAllOrders();
	return orders[orderNumber.trim().toUpperCase()] ?? null;
};

export const computeTrackingStage = (order: SimulatedOrder): OrderTrackingStage => {
	const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
	const match = TRACKING_THRESHOLDS_MS.find(([, thresholdMs]) => elapsedMs < thresholdMs);
	return match ? match[0] : 'delivered';
};
