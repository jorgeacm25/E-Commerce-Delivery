import { catalogCategoriesMock, catalogProductsMock } from '../data/catalog.mock';
import {
	CatalogCategory,
	CatalogProduct,
	catalogCategorySchema,
	catalogProductSchema,
	ProductSearchParams,
	ProductSearchResult,
	productSearchResultSchema,
} from '../interfaces';

// Servicio simulado para el catálogo: todavía no existe una tabla en
// Supabase para productos/combos de alimentos, así que se sirve en memoria
// con una latencia simulada (igual que src/services/home.service.ts) para
// que el consumo con TanStack Query sea realista (loading -> success/error).
// A diferencia de home.service.ts, aquí sí se valida la respuesta con Zod
// (ver src/interfaces/catalog.interface.ts) antes de resolver la promesa.
const simulateNetworkDelay = <T>(data: T, delayMs = 350): Promise<T> =>
	new Promise(resolve => {
		setTimeout(() => resolve(data), delayMs);
	});

const DEFAULT_PAGE_SIZE = 8;

const matchesQuery = (product: CatalogProduct, query: string): boolean => {
	const term = query.trim().toLowerCase();
	if (!term) return true;
	return (
		product.name.toLowerCase().includes(term) ||
		product.description.toLowerCase().includes(term)
	);
};

const relevanceScore = (product: CatalogProduct, query: string): number => {
	const term = query.trim().toLowerCase();
	if (!term) return 0;
	const name = product.name.toLowerCase();
	if (name.startsWith(term)) return 2;
	if (name.includes(term)) return 1;
	return 0;
};

const filterProducts = (
	products: CatalogProduct[],
	params: ProductSearchParams
): CatalogProduct[] => {
	return products.filter(product => {
		if (params.query && !matchesQuery(product, params.query)) return false;
		if (params.categorySlug && product.categorySlug !== params.categorySlug) return false;

		if (params.availability === 'out_of_stock' && product.availability !== 'out_of_stock') {
			return false;
		}
		if (params.availability === 'in_stock' && product.availability === 'out_of_stock') {
			return false;
		}

		if (params.minPrice !== undefined && product.priceUsd < params.minPrice) return false;
		if (params.maxPrice !== undefined && product.priceUsd > params.maxPrice) return false;

		return true;
	});
};

const sortProducts = (
	products: CatalogProduct[],
	params: ProductSearchParams
): CatalogProduct[] => {
	const sorted = [...products];

	switch (params.sort) {
		case 'price-asc':
			return sorted.sort((a, b) => a.priceUsd - b.priceUsd);
		case 'price-desc':
			return sorted.sort((a, b) => b.priceUsd - a.priceUsd);
		case 'popularity':
			return sorted.sort((a, b) => b.popularityScore - a.popularityScore);
		case 'relevance':
		default:
			if (params.query) {
				return sorted.sort(
					(a, b) => relevanceScore(b, params.query!) - relevanceScore(a, params.query!)
				);
			}
			return sorted;
	}
};

export const getCatalogCategories = (): Promise<CatalogCategory[]> =>
	simulateNetworkDelay(catalogCategoriesMock).then(data =>
		data.map(category => catalogCategorySchema.parse(category))
	);

export const getCatalogProducts = (
	params: ProductSearchParams = {}
): Promise<ProductSearchResult> => {
	const page = params.page && params.page > 0 ? params.page : 1;
	const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : DEFAULT_PAGE_SIZE;

	const filtered = sortProducts(filterProducts(catalogProductsMock, params), params);
	const total = filtered.length;
	const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
	const start = (page - 1) * pageSize;
	const items = filtered.slice(start, start + pageSize);

	const result: ProductSearchResult = { items, total, page, pageSize, totalPages };

	return simulateNetworkDelay(result).then(data => productSearchResultSchema.parse(data));
};

export const getCatalogProductBySlug = (slug: string): Promise<CatalogProduct | null> => {
	const product = catalogProductsMock.find(item => item.slug === slug) ?? null;

	return simulateNetworkDelay(product).then(data =>
		data ? catalogProductSchema.parse(data) : null
	);
};

export const getRelatedProducts = (slug: string): Promise<CatalogProduct[]> => {
	const product = catalogProductsMock.find(item => item.slug === slug);

	let related: CatalogProduct[] = [];

	if (product) {
		const bySlug = product.relatedSlugs
			.map(relatedSlug => catalogProductsMock.find(item => item.slug === relatedSlug))
			.filter((item): item is CatalogProduct => Boolean(item));

		related =
			bySlug.length > 0
				? bySlug
				: catalogProductsMock
						.filter(item => item.categorySlug === product.categorySlug && item.slug !== slug)
						.slice(0, 4);
	}

	return simulateNetworkDelay(related).then(data =>
		data.map(item => catalogProductSchema.parse(item))
	);
};

export const getCombos = (): Promise<CatalogProduct[]> => {
	const combos = catalogProductsMock.filter(product => product.isCombo);

	return simulateNetworkDelay(combos).then(data =>
		data.map(item => catalogProductSchema.parse(item))
	);
};
