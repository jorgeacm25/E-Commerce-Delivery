import { z } from 'zod';

// Se comparte entre el login de clientes (LoginPage.tsx) y el de staff/admin
// (AdminLoginPage.tsx). El backend staff no usa formato de correo (ej.
// "staff"), así que acá no se valida como email, solo que no esté vacío.
export const loginSchema = z.object({
	email: z.string().min(1, 'El correo o usuario es requerido'),
	password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
	.object({
		fullName: z.string().min(1, 'El nombre completo es requerido'),
		email: z.string().min(1, 'El correo electrónico es requerido').email('El correo electrónico no es válido'),
		phone: z.string().optional(),
		password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
		confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Las contraseñas no coinciden',
		path: ['confirmPassword'],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
	email: z.string().min(1, 'El correo electrónico es requerido').email('El correo electrónico no es válido'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
	.object({
		password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
		confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Las contraseñas no coinciden',
		path: ['confirmPassword'],
	});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
