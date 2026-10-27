import { describe, expect, it, vi } from 'vitest';
import { getCatalogProducts } from '../catalog.service';
import type { AdminCategory } from '../../interfaces';
import type { ProductResultDto } from '../../api/types';

const categoriesFixture: AdminCategory[] = [
	{ id: 'cat-despensa', slug: 'despensa', name: 'Despensa' },
	{ id: 'cat-bebidas', slug: 'bebidas', name: 'Bebidas' },
];

const product = (overrides: Partial<ProductResultDto>): ProductResultDto => ({
	id: 'p-generic',
	name: 'Producto genérico',
	quantity: 10,
	unity: 'unidad',
	salePriceUsd: 5,
	discountPriceUsd: null,
	costCup: null,
	endDate: '2027-01-01T00:00:00Z',
	nameUserorAdmin: 'Staff Demo',
	categoryId: 'cat-despensa',
	categoryName: 'Despensa',
	provider: 'Proveedor Demo',
	updateAt: '2026-08-01T00:00:00Z',
	images: ['https://img/generic.jpg'],
	...overrides,
});

const productsFixture: ProductResultDto[] = [
	product({ id: 'p-arroz', name: 'Arroz 5 lb', salePriceUsd: 6.5 }),
	product({ id: 'p-frijoles', name: 'Frijoles negros 2 lb', salePriceUsd: 3.25 }),
	product({ id: 'p-aceite', name: 'Aceite de cocina 1 L', salePriceUsd: 4.8, images: [] }),
	product({
		id: 'p-jugo',
		name: 'Jugo natural 1 L',
		salePriceUsd: 2.9,
		categoryId: 'cat-bebidas',
		categoryName: 'Bebidas',
	}),
	product({
		id: 'p-refresco',
		name: 'Refresco 2 L',
		salePriceUsd: 3.5,
		quantity: 0,
		categoryId: 'cat-bebidas',
		categoryName: 'Bebidas',
	}),
	product({ id: 'p-cafe', name: 'Café molido 500 g', salePriceUsd: 5.75 }),
	product({ id: 'p-galletas', name: 'Galletas surtidas 500 g', salePriceUsd: 3.9 }),
	product({ id: 'p-leche', name: 'Leche en polvo 400 g', salePriceUsd: 6.9 }),
	product({ id: 'p-detergente', name: 'Detergente en polvo 1 kg', salePriceUsd: 4.2 }),
	product({ id: 'p-jabon', name: 'Jabón de baño pack x3', salePriceUsd: 3.1 }),
];

vi.mock('../../api/client', () => ({
	apiFetch: vi.fn((path: string) => {
		if (path === '/api/category') return Promise.resolve(categoriesFixture);
		if (path === '/api/product') return Promise.resolve(productsFixture);
		return Promise.reject(new Error(`ruta inesperada en el test: ${path}`));
	}),
}));

describe('catalog.service getCatalogProducts', () => {
	it('filtra por texto de búsqueda en nombre y descripción', async () => {
		const result = await getCatalogProducts({ query: 'arroz' });

		expect(result.items.length).toBeGreaterThan(0);
		expect(
			result.items.every(
				item =>
					item.name.toLowerCase().includes('arroz') ||
					item.description.toLowerCase().includes('arroz')
			)
		).toBe(true);
		expect(result.items.some(item => item.slug === 'p-arroz')).toBe(true);
	});

	it('filtra por categoría', async () => {
		const result = await getCatalogProducts({ categorySlug: 'bebidas' });

		expect(result.items.length).toBeGreaterThan(0);
		expect(result.items.every(item => item.categorySlug === 'bebidas')).toBe(true);
	});

	it('filtra productos agotados', async () => {
		const result = await getCatalogProducts({ availability: 'out_of_stock', pageSize: 50 });

		expect(result.items.length).toBeGreaterThan(0);
		expect(result.items.every(item => item.availability === 'out_of_stock')).toBe(true);
	});

	it('filtra solo productos disponibles', async () => {
		const result = await getCatalogProducts({ availability: 'in_stock', pageSize: 50 });

		expect(result.items.every(item => item.availability !== 'out_of_stock')).toBe(true);
	});

	it('filtra por rango de precio', async () => {
		const result = await getCatalogProducts({ minPrice: 5, maxPrice: 7, pageSize: 50 });

		expect(result.items.length).toBeGreaterThan(0);
		expect(result.items.every(item => item.priceUsd >= 5 && item.priceUsd <= 7)).toBe(true);
	});

	it('ordena por precio ascendente', async () => {
		const result = await getCatalogProducts({ sort: 'price-asc', pageSize: 50 });
		const prices = result.items.map(item => item.priceUsd);

		expect(prices).toEqual([...prices].sort((a, b) => a - b));
	});

	it('ordena por precio descendente', async () => {
		const result = await getCatalogProducts({ sort: 'price-desc', pageSize: 50 });
		const prices = result.items.map(item => item.priceUsd);

		expect(prices).toEqual([...prices].sort((a, b) => b - a));
	});

	it('ordena por popularidad', async () => {
		const result = await getCatalogProducts({ sort: 'popularity', pageSize: 50 });
		const scores = result.items.map(item => item.popularityScore);

		expect(scores).toEqual([...scores].sort((a, b) => b - a));
	});

	it('pagina los resultados', async () => {
		const firstPage = await getCatalogProducts({ page: 1, pageSize: 5 });
		const secondPage = await getCatalogProducts({ page: 2, pageSize: 5 });

		expect(firstPage.items).toHaveLength(5);
		expect(secondPage.items).toHaveLength(5);
		expect(firstPage.items.map(item => item.id)).not.toEqual(
			secondPage.items.map(item => item.id)
		);
		expect(firstPage.totalPages).toBeGreaterThan(1);
	});

	it('devuelve una página vacía cuando el número de página excede el total', async () => {
		const result = await getCatalogProducts({ page: 999, pageSize: 5 });

		expect(result.items).toEqual([]);
		expect(result.total).toBeGreaterThan(0);
	});
});
