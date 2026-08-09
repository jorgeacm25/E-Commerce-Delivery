import { z } from 'zod';
import { AdminComboInput } from '../interfaces';

// `productId`, no `id`: useFieldArray reserva la clave `id` para su propio
// tracking interno de filas y la pisa en silencio si el dato ya trae una.
export const comboProductFormSchema = z.object({
	productId: z.string().min(1),
	quantity: z.coerce.number().int().min(1, 'Debe ser al menos 1'),
});
export type ComboProductFormValues = z.infer<typeof comboProductFormSchema>;

export const comboFormSchema = z
	.object({
		name: z.string().trim().min(2, 'El nombre es requerido').max(120, 'No debe exceder los 120 carácteres'),
		priceUsd: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
		hasDiscount: z.boolean(),
		discountPriceUsd: z.coerce.number().min(0.01, 'Debe ser mayor a 0').optional(),
		products: z.array(comboProductFormSchema).min(1, 'Agrega al menos un producto al combo'),
	})
	.refine(data => !data.hasDiscount || data.discountPriceUsd !== undefined, {
		message: 'Completa el precio con descuento',
		path: ['discountPriceUsd'],
	})
	.refine(
		data => !data.hasDiscount || data.discountPriceUsd === undefined || data.discountPriceUsd < data.priceUsd,
		{
			message: 'Debe ser menor al precio de venta',
			path: ['discountPriceUsd'],
		}
	);
export type ComboFormValues = z.infer<typeof comboFormSchema>;

// El backend espera `products: {id, quantity}[]` (ver adminCombos.service.ts)
// — `productId` es solo el nombre de campo del formulario, por la colisión
// con useFieldArray explicada arriba.
export const comboFormValuesToInput = (values: ComboFormValues): AdminComboInput => ({
	name: values.name,
	priceUsd: values.priceUsd,
	discountPriceUsd: values.hasDiscount ? (values.discountPriceUsd ?? null) : null,
	products: values.products.map(product => ({ id: product.productId, quantity: product.quantity })),
});
