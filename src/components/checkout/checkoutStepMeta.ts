import { CHECKOUT_STEP_IDS, CheckoutStepId } from './checkoutStepIds';

export interface CheckoutStepMeta {
	id: CheckoutStepId;
	title: string;
}

const STEP_TITLES: Record<CheckoutStepId, string> = {
	buyer: 'Datos del comprador',
	recipient: 'Datos del destinatario',
	address: 'Dirección en Cuba',
	location: 'Provincia y municipio',
	references: 'Referencias y teléfono',
	delivery: 'Modalidad de entrega',
	instructions: 'Instrucciones especiales',
	review: 'Revisión del pedido',
	payment: 'Pago',
};

export const CHECKOUT_STEPS: CheckoutStepMeta[] = CHECKOUT_STEP_IDS.map(id => ({
	id,
	title: STEP_TITLES[id],
}));
