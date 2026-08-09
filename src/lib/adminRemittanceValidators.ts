import { z } from 'zod';

export const remittanceFormSchema = z.object({
	recipientName: z.string().trim().min(2, 'El destinatario es requerido'),
	amountUsd: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
	amountCup: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
	notes: z.string().trim().max(500, 'No debe exceder los 500 carácteres').optional(),
});
export type RemittanceFormValues = z.infer<typeof remittanceFormSchema>;
