import { z } from 'zod';

export const sellerFormSchema = z.object({
	fullName: z.string().trim().min(2, 'El nombre es requerido'),
	phone: z.string().trim().min(1, 'El teléfono es requerido'),
	commissionPercentage: z.coerce
		.number()
		.min(0, 'Debe ser 0 o mayor')
		.max(100, 'No puede superar 100'),
});
export type SellerFormValues = z.infer<typeof sellerFormSchema>;
