import { z } from 'zod';

// Esquemas de validación del checkout por pasos (ver
// src/pages/public/CheckoutPage.tsx). El formulario completo es un único
// React Hook Form con secciones anidadas (buyer, recipient, address...);
// cada paso del wizard valida solo los campos de su propia sección con
// `trigger()`, pero `checkoutFormSchema` también sirve para validar el
// envío final completo antes de simular el pago.

const phoneRegex = /^\+?[0-9][0-9\s-]{6,19}$/;

export const buyerSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(2, 'El nombre completo es requerido')
		.max(80, 'El nombre no debe exceder los 80 carácteres'),
	email: z.string().trim().min(1, 'El correo es requerido').email('El correo electrónico no es válido'),
	phone: z.string().trim().regex(phoneRegex, 'Ingresa un teléfono válido'),
	country: z
		.string()
		.trim()
		.min(2, 'El país desde donde compras es requerido')
		.max(56, 'El país no debe exceder los 56 carácteres'),
});
export type BuyerFormValues = z.infer<typeof buyerSchema>;

export const recipientSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(2, 'El nombre completo del destinatario es requerido')
		.max(80, 'El nombre no debe exceder los 80 carácteres'),
	phone: z.string().trim().regex(phoneRegex, 'Ingresa un teléfono válido en Cuba'),
	relationship: z
		.string()
		.trim()
		.max(40, 'No debe exceder los 40 carácteres')
		.optional()
		.or(z.literal('')),
});
export type RecipientFormValues = z.infer<typeof recipientSchema>;

export const deliveryAddressSchema = z.object({
	addressLine1: z
		.string()
		.trim()
		.min(4, 'La dirección es requerida')
		.max(120, 'La dirección no debe exceder los 120 carácteres'),
	addressLine2: z
		.string()
		.trim()
		.max(120, 'No debe exceder los 120 carácteres')
		.optional()
		.or(z.literal('')),
});
export type DeliveryAddressFormValues = z.infer<typeof deliveryAddressSchema>;

export const locationSchema = z.object({
	provinceId: z.string().min(1, 'Selecciona una provincia'),
	municipality: z.string().min(1, 'Selecciona un municipio'),
});
export type LocationFormValues = z.infer<typeof locationSchema>;

export const referencesSchema = z.object({
	referencePoint: z
		.string()
		.trim()
		.min(4, 'Describe un punto de referencia cercano al destino')
		.max(160, 'No debe exceder los 160 carácteres'),
	alternatePhone: z
		.string()
		.trim()
		.regex(phoneRegex, 'Ingresa un teléfono válido')
		.optional()
		.or(z.literal('')),
});
export type ReferencesFormValues = z.infer<typeof referencesSchema>;

export const deliveryModalitySchema = z.object({
	modality: z.enum(['home_delivery', 'pickup_point'], {
		errorMap: () => ({ message: 'Selecciona una modalidad de entrega' }),
	}),
});
export type DeliveryModalityFormValues = z.infer<typeof deliveryModalitySchema>;

export const instructionsSchema = z.object({
	specialInstructions: z
		.string()
		.trim()
		.max(300, 'No debe exceder los 300 carácteres')
		.optional()
		.or(z.literal('')),
});
export type InstructionsFormValues = z.infer<typeof instructionsSchema>;

export const paymentMethodSchema = z.enum(['cash_on_delivery', 'zelle', 'bank_transfer', 'card_manual']);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentSchema = z.object({
	method: paymentMethodSchema,
});
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const consentSchema = z.object({
	acceptPolicies: z
		.boolean()
		.refine(value => value === true, { message: 'Debes aceptar las políticas para continuar' }),
});
export type ConsentFormValues = z.infer<typeof consentSchema>;

export const checkoutFormSchema = z.object({
	buyer: buyerSchema,
	recipient: recipientSchema,
	address: deliveryAddressSchema,
	location: locationSchema,
	references: referencesSchema,
	delivery: deliveryModalitySchema,
	instructions: instructionsSchema,
	payment: paymentSchema,
	consent: consentSchema,
});
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const checkoutDefaultValues: CheckoutFormValues = {
	buyer: { fullName: '', email: '', phone: '', country: '' },
	recipient: { fullName: '', phone: '', relationship: '' },
	address: { addressLine1: '', addressLine2: '' },
	location: { provinceId: '', municipality: '' },
	references: { referencePoint: '', alternatePhone: '' },
	delivery: { modality: 'home_delivery' },
	instructions: { specialInstructions: '' },
	payment: { method: 'cash_on_delivery' },
	consent: { acceptPolicies: false },
};

