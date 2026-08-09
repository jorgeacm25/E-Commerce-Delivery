import { z } from 'zod';

export const expenseFormSchema = z.object({
	description: z.string().trim().min(2, 'La descripción es requerida'),
	amountUsd: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
	amountCup: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
	category: z.string().trim().min(1, 'La categoría es requerida'),
	date: z.string().min(1, 'Selecciona una fecha'),
});
export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
