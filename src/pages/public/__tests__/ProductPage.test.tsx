import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '../../../store/cart.store';
import { ProductPage } from '../ProductPage';

const renderProductPage = (slug = 'arroz-5lb') => {
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
	});

	it('cambia el precio mostrado al seleccionar otra variante', async () => {
		renderProductPage();

		// Al cargar, se selecciona automáticamente la primera variante (2 lb).
		await screen.findByRole('heading', { name: /arroz 5lb/i });
		expect(screen.getByText('$2.90')).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(screen.getByRole('radio', { name: '10 lb' }));

		expect(screen.getByText('$10.90')).toBeInTheDocument();
	});

	it('permite cambiar la cantidad con el selector', async () => {
		renderProductPage();
		await screen.findByRole('heading', { name: /arroz 5lb/i });

		const user = userEvent.setup();
		const increaseButton = screen.getByRole('button', { name: 'Aumentar cantidad' });

		await user.click(increaseButton);
		await user.click(increaseButton);

		expect(screen.getByRole('status')).toHaveTextContent('3');
	});

	it('agrega el producto al carrito con la variante y cantidad seleccionadas', async () => {
		renderProductPage();
		await screen.findByRole('heading', { name: /arroz 5lb/i });

		const user = userEvent.setup();
		await user.click(screen.getByRole('radio', { name: '10 lb' }));
		await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));
		await user.click(screen.getByRole('button', { name: /agregar al carrito/i }));

		const items = useCartStore.getState().items;
		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			variantId: 'arroz-10lb',
			quantity: 2,
			price: 10.9,
		});
	});
});
