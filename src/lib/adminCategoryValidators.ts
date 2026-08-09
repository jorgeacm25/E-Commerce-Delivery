import { z } from 'zod';

export const categoryFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'El nombre es requerido')
		.max(60, 'No debe exceder los 60 carácteres'),
	slug: z
		.string()
		.trim()
		.min(2, 'El slug es requerido')
		.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Usa minúsculas, números y guiones (ej. carnes-rojas)'),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
