import { z } from 'zod';

// A diferencia del resto de src/interfaces (tipos TS planos), este archivo
// define los schemas de Zod como fuente de verdad: el catálogo valida en
// runtime las respuestas del servicio simulado (ver
// src/services/catalog.service.ts), así que los tipos se infieren de los
// schemas en vez de declararse por separado.

export const productAvailabilitySchema = z.enum(['in_stock', 'low_stock', 'out_of_stock']);
export type ProductAvailability = z.infer<typeof productAvailabilitySchema>;

// Filtro de disponibilidad del catálogo: agrupa 'in_stock'+'low_stock' bajo
// "disponible" frente a 'out_of_stock' ("agotado"), a diferencia del campo
// de disponibilidad del producto que distingue las tres variantes para el UI.
export const availabilityFilterSchema = z.enum(['in_stock', 'out_of_stock']);
export type AvailabilityFilter = z.infer<typeof availabilityFilterSchema>;

export const catalogCategorySchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	imageUrl: z.string(),
	productCount: z.number(),
});
export type CatalogCategory = z.infer<typeof catalogCategorySchema>;

export const catalogProductVariantSchema = z.object({
	id: z.string(),
	label: z.string(),
	priceUsd: z.number(),
	stock: z.number(),
});
export type CatalogProductVariant = z.infer<typeof catalogProductVariantSchema>;

export const catalogComboItemSchema = z.object({
	productName: z.string(),
	imageUrl: z.string(),
	quantity: z.number(),
	unit: z.string(),
});
export type CatalogComboItem = z.infer<typeof catalogComboItemSchema>;

export const catalogProductSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	description: z.string(),
	images: z.array(z.string()).min(1),
	categorySlug: z.string(),
	categoryName: z.string(),
	priceUsd: z.number(),
	unit: z.string(),
	weightOrUnitLabel: z.string(),
	stock: z.number(),
	availability: productAvailabilitySchema,
	variants: z.array(catalogProductVariantSchema),
	isCombo: z.boolean(),
	comboItems: z.array(catalogComboItemSchema).optional(),
	deliveryZoneIds: z.array(z.string()),
	popularityScore: z.number(),
	relatedSlugs: z.array(z.string()),
});
export type CatalogProduct = z.infer<typeof catalogProductSchema>;

export const productSortSchema = z.enum(['relevance', 'price-asc', 'price-desc', 'popularity']);
export type ProductSort = z.infer<typeof productSortSchema>;

export const productSearchParamsSchema = z.object({
	query: z.string().optional(),
	categorySlug: z.string().optional(),
	availability: availabilityFilterSchema.optional(),
	minPrice: z.number().optional(),
	maxPrice: z.number().optional(),
	sort: productSortSchema.optional(),
	page: z.number().optional(),
	pageSize: z.number().optional(),
});
export type ProductSearchParams = z.infer<typeof productSearchParamsSchema>;

export const productSearchResultSchema = z.object({
	items: z.array(catalogProductSchema),
	total: z.number(),
	page: z.number(),
	pageSize: z.number(),
	totalPages: z.number(),
});
export type ProductSearchResult = z.infer<typeof productSearchResultSchema>;
