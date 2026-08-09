import { z } from 'zod';

export const paymentAccountFormSchema = z.object({
	tipo: z.enum(['zelle', 'paypal']),
	titular: z.string().trim().min(2, 'El titular es requerido'),
	referencia: z.string().trim().min(2, 'La referencia es requerida'),
	prioridad: z.coerce.number().int().min(0, 'Debe ser 0 o mayor'),
});
export type PaymentAccountFormValues = z.infer<typeof paymentAccountFormSchema>;
