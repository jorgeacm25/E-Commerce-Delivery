import { z } from 'zod';

const phoneRegex = /^\+?[0-9][0-9\s-]{6,19}$/;

export const profileFormSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(2, 'El nombre completo es requerido')
		.max(80, 'El nombre no debe exceder los 80 carácteres'),
	phone: z
		.string()
		.trim()
		.regex(phoneRegex, 'Ingresa un teléfono válido')
		.optional()
		.or(z.literal('')),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const addressFormSchema = z.object({
	label: z.string().trim().max(40, 'No debe exceder los 40 carácteres').optional().or(z.literal('')),
	province: z.string().min(1, 'Selecciona una provincia'),
	municipality: z.string().min(1, 'Selecciona un municipio'),
	addressLine: z
		.string()
		.trim()
		.min(4, 'La dirección es requerida')
		.max(160, 'No debe exceder los 160 carácteres'),
	referenceNotes: z
		.string()
		.trim()
		.max(160, 'No debe exceder los 160 carácteres')
		.optional()
		.or(z.literal('')),
	isDefault: z.boolean().optional(),
});
export type AddressFormValues = z.infer<typeof addressFormSchema>;

export const recipientFormSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(2, 'El nombre completo es requerido')
		.max(80, 'El nombre no debe exceder los 80 carácteres'),
	phone: z.string().trim().regex(phoneRegex, 'Ingresa un teléfono válido en Cuba'),
	nationalId: z
		.string()
		.trim()
		.max(20, 'No debe exceder los 20 carácteres')
		.optional()
		.or(z.literal('')),
	province: z.string().min(1, 'Selecciona una provincia'),
	municipality: z.string().min(1, 'Selecciona un municipio'),
	addressLine: z
		.string()
		.trim()
		.min(4, 'La dirección es requerida')
		.max(160, 'No debe exceder los 160 carácteres'),
	notes: z.string().trim().max(160, 'No debe exceder los 160 carácteres').optional().or(z.literal('')),
	isDefault: z.boolean().optional(),
});
export type RecipientFormValues = z.infer<typeof recipientFormSchema>;

export const supportCaseFormSchema = z.object({
	category: z.enum(['pedido', 'pago', 'entrega', 'producto', 'otro'], {
		errorMap: () => ({ message: 'Selecciona una categoría' }),
	}),
	subject: z
		.string()
		.trim()
		.min(4, 'El asunto es requerido')
		.max(100, 'No debe exceder los 100 carácteres'),
	message: z
		.string()
		.trim()
		.min(10, 'Cuéntanos con más detalle qué sucede (mínimo 10 carácteres)')
		.max(1000, 'No debe exceder los 1000 carácteres'),
	orderReference: z
		.string()
		.trim()
		.max(20, 'No debe exceder los 20 carácteres')
		.optional()
		.or(z.literal('')),
});
export type SupportCaseFormValues = z.infer<typeof supportCaseFormSchema>;

export const changePasswordSchema = z
	.object({
		password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
		confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Las contraseñas no coinciden',
		path: ['confirmPassword'],
	});
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
