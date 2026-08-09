import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CatalogPage } from '../CatalogPage';
import type { ProductResultDto } from '../../../api/types';
import type { AdminCategory } from '../../../interfaces';

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
	product({ id: 'p-arroz', name: 'Arroz 5lb', salePriceUsd: 6.5 }),
	product({ id: 'p-cafe', name: 'Café molido', salePriceUsd: 4.5 }),
	product({
		id: 'p-refresco',
		name: 'Refresco de cola',
		salePriceUsd: 2.5,
		categoryId: 'cat-bebidas',
		categoryName: 'Bebidas',
	}),
	product({ id: 'p-azucar', name: 'Azúcar blanca', salePriceUsd: 1.8, quantity: 0 }),
];

vi.mock('../../../api/client', () => ({
	apiFetch: vi.fn((path: string) => {
		if (path === '/api/category') return Promise.resolve(categoriesFixture);
		if (path === '/api/product') return Promise.resolve(productsFixture);
		return Promise.reject(new Error(`ruta inesperada en el test: ${path}`));
	}),
}));

const LocationProbe = () => {
	const location = useLocation();
	return <div data-testid='location-search'>{location.search}</div>;
};

const renderCatalogPage = (initialEntries: string[] = ['/catalogo']) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={initialEntries}>
				<CatalogPage />
				<LocationProbe />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('CatalogPage', () => {
	it('carga y muestra los productos del catálogo', async () => {
		renderCatalogPage();

		expect(
			await screen.findByRole('link', { name: /arroz 5lb/i })
		).toBeInTheDocument();
	});

	it('filtra por texto de búsqueda y sincroniza el parámetro en la URL', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('link', { name: /arroz 5lb/i });

		const searchBox = screen.getByRole('searchbox', { name: /buscar en el catálogo/i });
		await user.type(searchBox, 'arroz');

		expect(await screen.findByRole('link', { name: /arroz 5lb/i })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: /café molido/i })).not.toBeInTheDocument();

		await waitFor(() =>
			expect(screen.getByTestId('location-search')).toHaveTextContent('buscar=arroz')
		);
	});

	it('filtra por categoría y sincroniza el parámetro en la URL', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('link', { name: /arroz 5lb/i });

		const categorySelect = screen.getByLabelText('Categoría');
		await user.selectOptions(categorySelect, 'bebidas');

		expect(await screen.findByRole('link', { name: /refresco de cola/i })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: /arroz 5lb/i })).not.toBeInTheDocument();

		await waitFor(() =>
			expect(screen.getByTestId('location-search')).toHaveTextContent('categoria=bebidas')
		);
	});

	it('filtra por disponibilidad', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('link', { name: /arroz 5lb/i });

		const availabilitySelect = screen.getByLabelText('Disponibilidad');
		await user.selectOptions(availabilitySelect, 'out_of_stock');

		expect(await screen.findByRole('link', { name: /azúcar blanca/i })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: /arroz 5lb/i })).not.toBeInTheDocument();
	});
});
