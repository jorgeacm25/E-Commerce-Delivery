import { DeliveryModalityFormValues, PaymentMethod } from '../lib/checkoutValidators';

export interface DeliveryModalityOption {
	value: DeliveryModalityFormValues['modality'];
	label: string;
	description: string;
	cost: number;
}

// Costo fijo de entrega por modalidad (no depende de la provincia todavía:
// no hay tarifario real, ver riesgo de contenido simulado en
// docs/PROJECT_STATE.md). Se aplica al carrito vía setDeliveryCost al
// avanzar del paso de modalidad de entrega.
export const DELIVERY_MODALITY_OPTIONS: DeliveryModalityOption[] = [
	{
		value: 'home_delivery',
		label: 'Entrega a domicilio',
		description: 'Un mensajero lleva el pedido directamente a la dirección del destinatario.',
		cost: 5,
	},
	{
		value: 'pickup_point',
		label: 'Recogida en punto de entrega',
		description:
			'El destinatario recoge el pedido en el punto de entrega más cercano a su municipio, sin costo adicional.',
		cost: 0,
	},
];

export interface PaymentMethodOption {
	value: PaymentMethod;
	label: string;
	description: string;
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
	{
		value: 'cash_on_delivery',
		label: 'Efectivo al recibir',
		description:
			'El destinatario paga en efectivo, en la moneda local equivalente, al recibir el pedido en Cuba.',
	},
	{
		value: 'zelle',
		label: 'Zelle',
		description: 'Te enviaremos los datos para completar el pago por Zelle.',
	},
	{
		value: 'bank_transfer',
		label: 'Transferencia bancaria',
		description: 'Transferencia a la cuenta bancaria que te indicará soporte.',
	},
	{
		value: 'card_manual',
		label: 'Tarjeta (verificación manual)',
		description: 'Subes el comprobante de pago después y lo verificamos manualmente.',
	},
];
