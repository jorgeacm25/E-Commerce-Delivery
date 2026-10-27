import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from '../../../store/cart.store';
import { useAuth } from '../../../hooks';
import { ProductPage } from '../ProductPage';
import type { ProductResultDto } from '../../../api/types';
import type { AdminCategory } from '../../../interfaces';

// El backend real (api/product) no tiene variantes/presentaciones múltiples
// por producto (a diferencia del catálogo simulado anterior, que sí las
// tenía) — ver el comentario en src/interfaces/adminProduct.interface.ts.
// Este test cubre lo que sí existe hoy: precio único, selector de cantidad
// y agregar al carrito.
const categoriesFixture: AdminCategory[] = [{ id: 'cat-despensa', slug: 'despensa', name: 'Despensa' }];

const productFixture: ProductResultDto = {
	id: 'p-arroz',
	name: 'Arroz 5 lb',
	quantity: 20,
	unity: 'unidad',
	salePriceUsd: 6.5,
	discountPriceUsd: null,
	costCup: null,
	endDate: '2027-01-01T00:00:00Z',
	nameUserorAdmin: 'Staff Demo',
	categoryId: 'cat-despensa',
	categoryName: 'Despensa',
	provider: 'Proveedor Demo',
	updateAt: '2026-08-01T00:00:00Z',
	images: ['https://img/arroz.jpg'],
};

vi.mock('../../../api/client', () => ({
	apiFetch: vi.fn((path: string) => {
		if (path === '/api/category') return Promise.resolve(categoriesFixture);
		if (path === '/api/product') return Promise.resolve([productFixture]);
		return Promise.reject(new Error(`ruta inesperada en el test: ${path}`));
	}),
}));

vi.mock('../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../hooks')>('../../../hooks');
	return { ...actual, useAuth: vi.fn() };
});

const useAuthMock = vi.mocked(useAuth);

const renderProductPage = (slug = 'p-arroz') => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[`/producto/${slug}`]}>
				<Routes>
					<Route path='/producto/:slug' element={<ProductPage />} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('ProductPage', () => {
	beforeEach(() => {
		useCartStore.setState({ items: [], totalItemsInCart: 0, totalAmount: 0 });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ user: null } as any);
	});

	it('muestra el nombre y el precio del producto', async () => {
		renderProductPage();

		await screen.findByRole('heading', { name: /arroz 5 lb/i });
		expect(screen.getByText('$6.50')).toBeInTheDocument();
	});

	it('permite cambiar la cantidad con el selector', async () => {
		renderProductPage();
		await screen.findByRole('heading', { name: /arroz 5 lb/i });

		const user = userEvent.setup();
		const increaseButton = screen.getByRole('button', { name: 'Aumentar cantidad' });

		await user.click(increaseButton);
		await user.click(increaseButton);

		expect(screen.getByRole('status')).toHaveTextContent('3');
	});

	it('agrega el producto al carrito con la cantidad seleccionada', async () => {
		renderProductPage();
		await screen.findByRole('heading', { name: /arroz 5 lb/i });

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));
		await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));

		const items = useCartStore.getState().items;
		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			variantId: 'p-arroz',
			quantity: 2,
			price: 6.5,
		});
	});
});
