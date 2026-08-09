import { beforeEach, describe, expect, it } from 'vitest';
import { CheckoutFormValues } from '../../lib/checkoutValidators';
import {
	getSimulatedOrdersByUserId,
	submitSimulatedOrder,
} from '../checkoutSimulation.service';

const form: CheckoutFormValues = {
	buyer: { fullName: 'Juana Pérez', email: 'juana@example.com', phone: '+1 305 555 1234', country: 'Estados Unidos' },
	recipient: { fullName: 'Pedro Pérez', phone: '+53 5 123 4567', relationship: '' },
	address: { addressLine1: 'Calle 23 #456', addressLine2: '' },
	location: { provinceId: 'la-habana', municipality: 'Plaza' },
	references: { referencePoint: 'Frente al parque', alternatePhone: '' },
	delivery: { modality: 'home_delivery' },
	instructions: { specialInstructions: '' },
	payment: { method: 'cash_on_delivery' },
	consent: { acceptPolicies: true },
};

const totals = { subtotal: 10, discount: 0, deliveryCost: 5, total: 15 };

// El checkout simulado falla ~12% de las veces a propósito (ver el propio
// servicio); se reintenta hasta 20 veces para evitar pruebas inestables.
const submitUntilSuccess = async (userId?: string) => {
	for (let attempt = 0; attempt < 20; attempt++) {
		try {
			return await submitSimulatedOrder({ form, items: [], totals, userId });
		} catch {
			continue;
		}
	}
	throw new Error('No se pudo simular un pedido exitoso tras 20 intentos');
};

describe('checkoutSimulation.service', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('etiqueta el pedido con el userId cuando hay sesión activa', async () => {
		const order = await submitUntilSuccess('user-1');
		expect(order.userId).toBe('user-1');
	});

	it('deja userId sin definir para pedidos de invitado', async () => {
		const order = await submitUntilSuccess(undefined);
		expect(order.userId).toBeUndefined();
	});

	it('filtra y ordena los pedidos por userId, del más reciente al más antiguo', async () => {
		const orderA = await submitUntilSuccess('user-1');
		const orderB = await submitUntilSuccess('user-2');
		const orderC = await submitUntilSuccess('user-1');

		const ordersForUser1 = getSimulatedOrdersByUserId('user-1');

		expect(ordersForUser1.map(order => order.orderNumber)).toEqual([
			orderC.orderNumber,
			orderA.orderNumber,
		]);
		expect(ordersForUser1.every(order => order.orderNumber !== orderB.orderNumber)).toBe(true);
	});

	it('devuelve un arreglo vacío si el usuario no tiene pedidos', () => {
		expect(getSimulatedOrdersByUserId('sin-pedidos')).toEqual([]);
	});
});
