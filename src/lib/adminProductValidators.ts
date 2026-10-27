import { z } from 'zod';

// El backend .NET real (api/product) no modela variantes/presentaciones
// múltiples, slug ni descripción — solo nombre, cantidad, unidad,
// proveedor, categoría, precio, vencimiento e imágenes. `costCup` SÍ se
// persiste en el backend (precio de compra, campo CostCup — habilita el
// rendimiento por venta del inventario) y se usa además para calcular
// `priceUsd` en modo automático. `pricingMode`/`marginUsd` siguen siendo
// campos solo-de-formulario (nunca se envían al backend).
export const productFormSchema = z
	.object({
		categoryId: z.string().min(1, 'Selecciona una categoría'),
		name: z.string().trim().min(2, 'El nombre es requerido').max(120, 'No debe exceder los 120 carácteres'),
		unit: z.string().trim().min(1, 'Requerido'),
		provider: z.string().trim().min(1, 'Requerido'),
		endDate: z.string().min(1, 'Selecciona una fecha de vencimiento'),
		pricingMode: z.enum(['fixed', 'auto']),
		priceUsd: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
		costCup: z.coerce.number().min(0, 'Debe ser 0 o mayor').optional(),
		marginUsd: z.coerce.number().min(0, 'Debe ser 0 o mayor').optional(),
		stock: z.coerce.number().int().min(0, 'Debe ser 0 o mayor'),
		hasDiscount: z.boolean(),
		discountPriceUsd: z.coerce.number().min(0.01, 'Debe ser mayor a 0').optional(),
	})
	.refine(data => data.pricingMode === 'fixed' || data.costCup !== undefined, {
		message: 'Completa el costo en CUP para el precio automático',
		path: ['costCup'],
	})
	.refine(data => data.pricingMode === 'fixed' || data.marginUsd !== undefined, {
		message: 'Completa el margen en USD para el precio automático',
		path: ['marginUsd'],
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
export type ProductFormValues = z.infer<typeof productFormSchema>;
