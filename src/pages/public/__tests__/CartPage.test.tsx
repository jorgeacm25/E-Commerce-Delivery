import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ICartItem } from '../../../components/shared/CartItem';
import { useCartStore } from '../../../store/cart.store';
import { CartPage } from '../CartPage';

const arroz: ICartItem = {
	variantId: 'arroz-5lb',
	productId: 'arroz',
	name: 'Arroz',
	variantLabel: '5 lb',
	price: 5.9,
	quantity: 2,
	image: '/arroz.jpg',
};

const renderCartPage = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={['/carrito']}>
				<CartPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('CartPage', () => {
	beforeEach(() => {
		localStorage.clear();
		useCartStore.setState({
			items: [],
			coupon: null,
			deliveryCost: 0,
			hasHydrated: true,
			totalItemsInCart: 0,
			totalAmount: 0,
			subtotal: 0,
			discount: 0,
			total: 0,
		});
	});

	it('muestra un estado vacío con enlace al catálogo cuando no hay productos', () => {
		renderCartPage();

		expect(screen.getByText(/todavía no agregas productos/i)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /ir al catálogo/i })).toHaveAttribute(
			'href',
			'/catalogo'
		);
	});

	it('muestra un esqueleto de carga mientras el carrito no se ha hidratado', () => {
		useCartStore.setState({ hasHydrated: false });
		renderCartPage();

		expect(screen.queryByText(/todavía no agregas productos/i)).not.toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: /carrito de compras/i })).not.toBeInTheDocument();
	});

	it('lista los productos del carrito y su resumen de totales', () => {
		useCartStore.getState().addItem(arroz);
		renderCartPage();

		expect(screen.getByText('Arroz')).toBeInTheDocument();
		expect(screen.getByText('5 lb')).toBeInTheDocument();
		expect(screen.getByText(/tienes 2 artículo/i)).toBeInTheDocument();
		expect(screen.getByText('Resumen del pedido')).toBeInTheDocument();
	});

	it('permite aumentar la cantidad de una línea desde el carrito', async () => {
		useCartStore.getState().addItem(arroz);
		renderCartPage();

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));

		expect(useCartStore.getState().items[0].quantity).toBe(3);
	});

	it('permite eliminar una línea del carrito', async () => {
		useCartStore.getState().addItem(arroz);
		renderCartPage();

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: /eliminar arroz del carrito/i }));

		expect(useCartStore.getState().items).toHaveLength(0);
		expect(await screen.findByText(/todavía no agregas productos/i)).toBeInTheDocument();
	});

	it('aplica un cupón válido y refleja el descuento en el resumen', async () => {
		useCartStore.getState().addItem({ ...arroz, price: 10, quantity: 2 });
		renderCartPage();

		const user = userEvent.setup();
		await user.type(screen.getByLabelText(/cupón de descuento/i), 'BIENVENIDA10');
		await user.click(screen.getByRole('button', { name: 'Aplicar' }));

		expect(await screen.findByText('BIENVENIDA10')).toBeInTheDocument();
		expect(screen.getByText('-$2.00')).toBeInTheDocument();
		expect(useCartStore.getState().total).toBeCloseTo(18);
	});

	it('muestra un error cuando el cupón no existe', async () => {
		useCartStore.getState().addItem(arroz);
		renderCartPage();

		const user = userEvent.setup();
		await user.type(screen.getByLabelText(/cupón de descuento/i), 'NOEXISTE');
		await user.click(screen.getByRole('button', { name: 'Aplicar' }));

		expect(await screen.findByText(/ese código de cupón no existe/i)).toBeInTheDocument();
	});

	it('vacía el carrito tras confirmar en el diálogo', async () => {
		useCartStore.getState().addItem(arroz);
		renderCartPage();

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: /vaciar carrito/i }));

		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getByText(/¿vaciar el carrito\?/i)).toBeInTheDocument();

		await user.click(within(dialog).getByRole('button', { name: 'Vaciar carrito' }));

		expect(useCartStore.getState().items).toHaveLength(0);
		expect(await screen.findByText(/todavía no agregas productos/i)).toBeInTheDocument();
	});
});
