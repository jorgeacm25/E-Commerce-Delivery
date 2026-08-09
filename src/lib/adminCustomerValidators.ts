import { z } from 'zod';

export const customerEditFormSchema = z.object({
	fullName: z.string().trim().min(2, 'El nombre es requerido'),
	phone: z.string().trim().optional(),
	password: z.union([z.string().trim().min(6, 'Mínimo 6 caracteres'), z.literal('')]).optional(),
});
export type CustomerEditFormValues = z.infer<typeof customerEditFormSchema>;
