import { z } from 'zod';

export const adminAccountFormSchema = z.object({
	fullName: z.string().trim().min(2, 'El nombre es requerido'),
	userName: z.string().trim().min(3, 'El usuario debe tener al menos 3 caracteres'),
	password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
	accountType: z.enum(['admin', 'user']),
});
export type AdminAccountFormValues = z.infer<typeof adminAccountFormSchema>;

export const adminAccountResetPasswordSchema = z.object({
	password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
export type AdminAccountResetPasswordValues = z.infer<typeof adminAccountResetPasswordSchema>;
