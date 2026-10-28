import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ICartItem } from '../../shared/CartItem';
import { CartLink } from '../../layout/CartLink';
import { useCartStore } from '../../../store/cart.store';
import { useGlobalStore } from '../../../store/global.store';
import { CartRedirect } from '../../../router/CartRedirect';
import { CartDrawer } from '../CartDrawer';

const arroz: ICartItem = {
	variantId: 'arroz-5lb',
	productId: 'arroz',
	name: 'Arroz',
	variantLabel: '5 lb',
	price: 5.9,
	quantity: 2,
	image: '/arroz.jpg',
};

const renderCart = (initialPath = '/') => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[initialPath]}>
				<CartLink />
				<CartDrawer />
				<Routes>
					<Route path='/' element={<p>Portada</p>} />
					<Route path='/carrito' element={<CartRedirect />} />
					<Route path='/checkout' element={<p>Página de checkout</p>} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>
	);
};

const openCart = async () => {
	const user = userEvent.setup();
	await user.click(screen.getByRole('button', { name: /carrito de compras/i }));
	return { user, dialog: screen.getByRole('dialog') };
};

describe('CartDrawer', () => {
	beforeEach(() => {
		localStorage.clear();
		useGlobalStore.setState({ isSheetOpen: false, sheetContent: null });
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

	it('está cerrado hasta que se pulsa el botón del carrito', async () => {
		renderCart();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

		const { dialog } = await openCart();
		expect(within(dialog).getByRole('heading', { name: 'Tu carrito' })).toBeInTheDocument();
	});

	it('/carrito abre el panel y lleva a la portada', () => {
		renderCart('/carrito');

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Portada')).toBeInTheDocument();
	});

	it('muestra un estado vacío con enlace al catálogo cuando no hay productos', async () => {
		renderCart();
		const { dialog } = await openCart();

		expect(within(dialog).getByText(/todavía no agregas productos/i)).toBeInTheDocument();
		expect(within(dialog).getByRole('link', { name: /ir al catálogo/i })).toHaveAttribute(
			'href',
			'/catalogo'
		);
	});

	it('muestra un esqueleto de carga mientras el carrito no se ha hidratado', async () => {
		useCartStore.setState({ hasHydrated: false });
		renderCart();
		const { dialog } = await openCart();

		expect(within(dialog).queryByText(/todavía no agregas productos/i)).not.toBeInTheDocument();
		expect(within(dialog).queryByText(/total estimado/i)).not.toBeInTheDocument();
	});

	it('lista los productos del carrito y su total', async () => {
		useCartStore.getState().addItem(arroz);
		renderCart();
		const { dialog } = await openCart();

		expect(within(dialog).getByRole('heading', { name: 'Tu carrito (2)' })).toBeInTheDocument();
		expect(within(dialog).getByText('Arroz')).toBeInTheDocument();
		expect(within(dialog).getByText('5 lb')).toBeInTheDocument();
		expect(within(dialog).getByText(/total estimado/i)).toBeInTheDocument();
	});

	it('permite aumentar la cantidad de una línea desde el carrito', async () => {
		useCartStore.getState().addItem(arroz);
		renderCart();
		const { user, dialog } = await openCart();

		await user.click(within(dialog).getByRole('button', { name: 'Aumentar cantidad' }));

		expect(useCartStore.getState().items[0].quantity).toBe(3);
	});

	it('permite eliminar una línea del carrito', async () => {
		useCartStore.getState().addItem(arroz);
		renderCart();
		const { user, dialog } = await openCart();

		await user.click(within(dialog).getByRole('button', { name: /eliminar arroz del carrito/i }));

		expect(useCartStore.getState().items).toHaveLength(0);
		expect(await within(dialog).findByText(/todavía no agregas productos/i)).toBeInTheDocument();
	});

	it('aplica un cupón válido y refleja el descuento en el total', async () => {
		useCartStore.getState().addItem({ ...arroz, price: 10, quantity: 2 });
		renderCart();
		const { user, dialog } = await openCart();

		await user.type(within(dialog).getByLabelText(/cupón de descuento/i), 'BIENVENIDA10');
		await user.click(within(dialog).getByRole('button', { name: 'Aplicar' }));

		expect(await within(dialog).findByText('BIENVENIDA10')).toBeInTheDocument();
		expect(within(dialog).getByText('-$2.00')).toBeInTheDocument();
		expect(useCartStore.getState().total).toBeCloseTo(18);
	});

	it('muestra un error cuando el cupón no existe', async () => {
		useCartStore.getState().addItem(arroz);
		renderCart();
		const { user, dialog } = await openCart();

		await user.type(within(dialog).getByLabelText(/cupón de descuento/i), 'NOEXISTE');
		await user.click(within(dialog).getByRole('button', { name: 'Aplicar' }));

		expect(await within(dialog).findByText(/ese código de cupón no existe/i)).toBeInTheDocument();
	});

	it('vacía el carrito tras confirmar en línea', async () => {
		useCartStore.getState().addItem(arroz);
		renderCart();
		const { user, dialog } = await openCart();

		await user.click(within(dialog).getByRole('button', { name: /vaciar carrito/i }));
		expect(within(dialog).getByText(/¿vaciar el carrito\?/i)).toBeInTheDocument();

		await user.click(within(dialog).getByRole('button', { name: 'Sí, vaciar' }));

		expect(useCartStore.getState().items).toHaveLength(0);
		expect(await within(dialog).findByText(/todavía no agregas productos/i)).toBeInTheDocument();
	});

	it('cierra con animación de salida al pulsar Cerrar', async () => {
		renderCart();
		const { user, dialog } = await openCart();

		await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }));

		expect(dialog.className).toContain('animate-slide-out');
		await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
	});

	it('cierra el panel y lleva al checkout', async () => {
		useCartStore.getState().addItem(arroz);
		renderCart();
		const { user, dialog } = await openCart();

		await user.click(within(dialog).getByRole('button', { name: 'Ir al checkout' }));

		// El panel se desmonta al terminar la animación de salida
		await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
		expect(screen.getByText('Página de checkout')).toBeInTheDocument();
	});
});
