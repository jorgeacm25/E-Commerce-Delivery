import { describe, expect, it } from 'vitest';
import { getCatalogProducts } from '../catalog.service';

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
		expect(result.items.some(item => item.slug === 'arroz-5lb')).toBe(true);
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
