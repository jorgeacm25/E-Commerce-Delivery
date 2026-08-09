import { apiFetch } from '../api/client';
import { ComboResultDto, ProductResultDto } from '../api/types';
import {
	AdminCategory,
	CatalogCategory,
	CatalogComboItem,
	CatalogProduct,
	catalogCategorySchema,
	catalogProductSchema,
	ProductAvailability,
	ProductSearchParams,
	ProductSearchResult,
	productSearchResultSchema,
} from '../interfaces';

// Catálogo público real, contra el backend .NET (api/product, api/category,
// api/combo) — el mismo que ya usa el panel admin (adminProducts.service.ts,
// adminCategories.service.ts, adminCombos.service.ts). El modelo de
// producto real no tiene slug, descripción ni variantes (a diferencia del
// CatalogProduct simulado con el que se construyó originalmente este
// catálogo): se usa el id del producto como slug de URL, la descripción
// queda vacía y variants siempre []. Los combos tampoco tienen imagen
// propia en el backend (ver ComboResultDto en api/types.ts) — se usa la
// foto del primer producto incluido que tenga una, o el placeholder.
const PLACEHOLDER_IMAGE = 'https://ui.shadcn.com/placeholder.svg';
const DEFAULT_PAGE_SIZE = 8;
const LOW_STOCK_THRESHOLD = 5;

const availabilityFromStock = (stock: number): ProductAvailability => {
	if (stock <= 0) return 'out_of_stock';
	if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
	return 'in_stock';
};

const fetchCategories = (): Promise<AdminCategory[]> =>
	apiFetch<AdminCategory[]>('/api/category', { auth: false });

const fetchProducts = (): Promise<ProductResultDto[]> =>
	apiFetch<ProductResultDto[]>('/api/product', { auth: false });

const fetchCombos = (): Promise<ComboResultDto[]> =>
	apiFetch<ComboResultDto[]>('/api/combo', { auth: false });

const mapProduct = (dto: ProductResultDto, categorySlugById: Map<string, string>): CatalogProduct => ({
	id: dto.id,
	slug: dto.id,
	name: dto.name,
	description: '',
	images: dto.images.length > 0 ? dto.images : [PLACEHOLDER_IMAGE],
	categorySlug: categorySlugById.get(dto.categoryId) ?? '',
	categoryName: dto.categoryName ?? '',
	priceUsd: dto.salePriceUsd,
	discountPriceUsd: dto.discountPriceUsd ?? undefined,
	unit: dto.unity,
	weightOrUnitLabel: dto.unity,
	stock: dto.quantity,
	availability: availabilityFromStock(dto.quantity),
	variants: [],
	isCombo: false,
	deliveryZoneIds: [],
	popularityScore: 0,
	relatedSlugs: [],
});

// Trae categorías y productos juntos (siempre van de la mano acá: el
// producto solo trae categoryId/categoryName, no el slug) y arma la lista
// completa de CatalogProduct. Se llama una vez por función pública de este
// archivo — a esta escala (decenas de productos) no vale la pena compartir
// caché entre ellas, igual que adminProducts.service.ts.
const getAllCatalogProducts = async (): Promise<CatalogProduct[]> => {
	const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
	const categorySlugById = new Map(categories.map(category => [category.id, category.slug]));
	return products.map(product => mapProduct(product, categorySlugById));
};

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
			// El backend no tiene una métrica de popularidad todavía
			// (popularityScore siempre es 0 para productos reales) — el orden
			// queda estable en vez de simular un ranking inventado.
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

export const getCatalogCategories = async (): Promise<CatalogCategory[]> => {
	const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);

	return categories
		.map(category =>
			catalogCategorySchema.parse({
				id: category.id,
				slug: category.slug,
				name: category.name,
				imageUrl: PLACEHOLDER_IMAGE,
				productCount: products.filter(product => product.categoryId === category.id).length,
			})
		)
		.sort((a, b) => a.name.localeCompare(b.name));
};

export const getCatalogProducts = async (
	params: ProductSearchParams = {}
): Promise<ProductSearchResult> => {
	const page = params.page && params.page > 0 ? params.page : 1;
	const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : DEFAULT_PAGE_SIZE;

	const all = await getAllCatalogProducts();
	const filtered = sortProducts(filterProducts(all, params), params);
	const total = filtered.length;
	const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
	const start = (page - 1) * pageSize;
	const items = filtered.slice(start, start + pageSize);

	const result: ProductSearchResult = { items, total, page, pageSize, totalPages };

	return productSearchResultSchema.parse(result);
};

export const getCatalogProductBySlug = async (slug: string): Promise<CatalogProduct | null> => {
	const all = await getAllCatalogProducts();
	const product = all.find(item => item.slug === slug);
	if (product) return catalogProductSchema.parse(product);

	// No es un producto — puede ser la ficha de un combo (comparten la misma
	// ruta /producto/:slug, ver ProductPage.tsx), que vive en una fuente
	// separada (api/combo, no api/product).
	const combos = await getCombos();
	const combo = combos.find(item => item.slug === slug) ?? null;

	return combo;
};

export const getRelatedProducts = async (slug: string): Promise<CatalogProduct[]> => {
	const all = await getAllCatalogProducts();
	const product = all.find(item => item.slug === slug);

	if (!product) return [];

	const related = all
		.filter(item => item.categorySlug === product.categorySlug && item.slug !== slug)
		.slice(0, 4);

	return related.map(item => catalogProductSchema.parse(item));
};

const mapCombo = (dto: ComboResultDto, imageByProductId: Map<string, string>): CatalogProduct => {
	const comboItems: CatalogComboItem[] = dto.products.map(product => ({
		productName: product.nameProduct ?? '',
		imageUrl: imageByProductId.get(product.id ?? '') ?? PLACEHOLDER_IMAGE,
		quantity: product.quantity,
		unit: product.unity ?? '',
	}));
	const image = comboItems.find(item => item.imageUrl !== PLACEHOLDER_IMAGE)?.imageUrl ?? PLACEHOLDER_IMAGE;

	return {
		id: dto.id,
		slug: dto.id,
		name: dto.name,
		description: '',
		images: [image],
		categorySlug: 'combos',
		categoryName: 'Combos',
		priceUsd: dto.salePriceUsd,
		discountPriceUsd: dto.discountPriceUsd ?? undefined,
		unit: 'combo',
		weightOrUnitLabel: `${dto.products.length} producto(s)`,
		// El backend no calcula disponibilidad de combo a partir del stock de
		// sus productos — se muestran siempre disponibles, igual que antes.
		stock: 1,
		availability: 'in_stock',
		variants: [],
		isCombo: true,
		comboItems,
		deliveryZoneIds: [],
		popularityScore: 0,
		relatedSlugs: [],
	};
};

export const getCombos = async (): Promise<CatalogProduct[]> => {
	const [combos, products] = await Promise.all([fetchCombos(), fetchProducts()]);
	const imageByProductId = new Map(products.map(product => [product.id, product.images[0] ?? PLACEHOLDER_IMAGE]));

	return combos.map(dto => catalogProductSchema.parse(mapCombo(dto, imageByProductId)));
};
