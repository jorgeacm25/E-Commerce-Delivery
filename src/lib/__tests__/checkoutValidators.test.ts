import { describe, expect, it } from 'vitest';
import {
	buyerSchema,
	checkoutDefaultValues,
	checkoutFormSchema,
	consentSchema,
	deliveryAddressSchema,
	deliveryModalitySchema,
	locationSchema,
	paymentSchema,
	recipientSchema,
	referencesSchema,
} from '../checkoutValidators';

const validBuyer = {
	fullName: 'Ana Pérez',
	email: 'ana@example.com',
	phone: '+53 5 123 4567',
	country: 'España',
};

const validRecipient = {
	fullName: 'Carlos Pérez',
	phone: '+53 5 987 6543',
	relationship: 'Hermano',
};

const validAddress = { addressLine1: 'Calle 23 #456, entre 10 y 12', addressLine2: '' };
const validLocation = { provinceId: 'la-habana', municipality: 'Playa' };
const validReferences = { referencePoint: 'Frente al parque, casa azul', alternatePhone: '' };

describe('buyerSchema', () => {
	it('acepta datos válidos', () => {
		expect(buyerSchema.safeParse(validBuyer).success).toBe(true);
	});

	it('rechaza un nombre demasiado corto', () => {
		const result = buyerSchema.safeParse({ ...validBuyer, fullName: 'A' });
		expect(result.success).toBe(false);
	});

	it('rechaza un correo inválido', () => {
		const result = buyerSchema.safeParse({ ...validBuyer, email: 'no-es-un-correo' });
		expect(result.success).toBe(false);
	});

	it('rechaza un teléfono con letras', () => {
		const result = buyerSchema.safeParse({ ...validBuyer, phone: 'abc-123' });
		expect(result.success).toBe(false);
	});

	it('rechaza un país vacío', () => {
		const result = buyerSchema.safeParse({ ...validBuyer, country: '' });
		expect(result.success).toBe(false);
	});
});

describe('recipientSchema', () => {
	it('acepta datos válidos, incluida la relación opcional en blanco', () => {
		expect(recipientSchema.safeParse({ ...validRecipient, relationship: '' }).success).toBe(true);
	});

	it('rechaza un teléfono inválido', () => {
		const result = recipientSchema.safeParse({ ...validRecipient, phone: '123' });
		expect(result.success).toBe(false);
	});

	it('rechaza un nombre vacío', () => {
		const result = recipientSchema.safeParse({ ...validRecipient, fullName: '' });
		expect(result.success).toBe(false);
	});
});

describe('deliveryAddressSchema', () => {
	it('acepta una dirección válida sin línea 2', () => {
		expect(deliveryAddressSchema.safeParse(validAddress).success).toBe(true);
	});

	it('rechaza una dirección demasiado corta', () => {
		const result = deliveryAddressSchema.safeParse({ addressLine1: 'Ab' });
		expect(result.success).toBe(false);
	});
});

describe('locationSchema', () => {
	it('acepta provincia y municipio seleccionados', () => {
		expect(locationSchema.safeParse(validLocation).success).toBe(true);
	});

	it('rechaza si falta la provincia', () => {
		const result = locationSchema.safeParse({ provinceId: '', municipality: 'Playa' });
		expect(result.success).toBe(false);
	});

	it('rechaza si falta el municipio', () => {
		const result = locationSchema.safeParse({ provinceId: 'la-habana', municipality: '' });
		expect(result.success).toBe(false);
	});
});

describe('referencesSchema', () => {
	it('acepta un punto de referencia válido sin teléfono alternativo', () => {
		expect(referencesSchema.safeParse(validReferences).success).toBe(true);
	});

	it('rechaza un punto de referencia demasiado corto', () => {
		const result = referencesSchema.safeParse({ ...validReferences, referencePoint: 'Ab' });
		expect(result.success).toBe(false);
	});

	it('rechaza un teléfono alternativo inválido', () => {
		const result = referencesSchema.safeParse({ ...validReferences, alternatePhone: 'no-telefono' });
		expect(result.success).toBe(false);
	});
});

describe('deliveryModalitySchema', () => {
	it.each(['home_delivery', 'pickup_point'] as const)('acepta la modalidad %s', modality => {
		expect(deliveryModalitySchema.safeParse({ modality }).success).toBe(true);
	});

	it('rechaza una modalidad desconocida', () => {
		const result = deliveryModalitySchema.safeParse({ modality: 'drone_delivery' });
		expect(result.success).toBe(false);
	});
});

describe('paymentSchema', () => {
	it.each(['cash_on_delivery', 'zelle', 'bank_transfer', 'card_manual'] as const)(
		'acepta el método de pago %s',
		method => {
			expect(paymentSchema.safeParse({ method }).success).toBe(true);
		}
	);

	it('rechaza un método de pago desconocido, y nunca acepta datos de tarjeta', () => {
		const result = paymentSchema.safeParse({ method: 'credit_card', cardNumber: '4111111111111111' });
		expect(result.success).toBe(false);
	});
});

describe('consentSchema', () => {
	it('acepta cuando se marcan las políticas', () => {
		expect(consentSchema.safeParse({ acceptPolicies: true }).success).toBe(true);
	});

	it('rechaza cuando no se marcan las políticas', () => {
		const result = consentSchema.safeParse({ acceptPolicies: false });
		expect(result.success).toBe(false);
	});
});

describe('checkoutFormSchema', () => {
	const validForm = {
		buyer: validBuyer,
		recipient: validRecipient,
		address: validAddress,
		location: validLocation,
		references: validReferences,
		delivery: { modality: 'home_delivery' as const },
		instructions: { specialInstructions: '' },
		payment: { method: 'cash_on_delivery' as const },
		consent: { acceptPolicies: true },
	};

	it('acepta un formulario completo válido', () => {
		expect(checkoutFormSchema.safeParse(validForm).success).toBe(true);
	});

	it('rechaza si falta aceptar las políticas, aunque el resto sea válido', () => {
		const result = checkoutFormSchema.safeParse({ ...validForm, consent: { acceptPolicies: false } });
		expect(result.success).toBe(false);
	});

	it('los valores por defecto no pasan la validación completa (requieren datos del comprador)', () => {
		expect(checkoutFormSchema.safeParse(checkoutDefaultValues).success).toBe(false);
	});
});
