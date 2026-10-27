import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ICartItem } from '../../../components/shared/CartItem';
import { CustomerOrder } from '../../../interfaces';
import { useCartStore } from '../../../store/cart.store';
import { useAdminMunicipalities, useAdminProvinces, useAuth } from '../../../hooks';
import { CheckoutPage } from '../CheckoutPage';
import * as orderService from '../../../services/order.service';

vi.mock('../../../services/order.service', () => ({
	createOrder: vi.fn(),
}));

vi.mock('../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../hooks')>('../../../hooks');
	return { ...actual, useAuth: vi.fn(), useAdminProvinces: vi.fn(), useAdminMunicipalities: vi.fn() };
});

const createOrderMock = vi.mocked(orderService.createOrder);
const useAuthMock = vi.mocked(useAuth);
const useAdminProvincesMock = vi.mocked(useAdminProvinces);
const useAdminMunicipalitiesMock = vi.mocked(useAdminMunicipalities);

const arroz: ICartItem = {
	variantId: 'arroz-5lb',
	productId: 'arroz',
	name: 'Arroz',
	variantLabel: '5 lb',
	price: 5.9,
	quantity: 2,
	image: '/arroz.jpg',
};

const fakeOrder: CustomerOrder = {
	id: 'order-1',
	customerId: 'user-1',
	status: 'Pending',
	totalAmount: 11.8,
	addressLine1: 'Calle 23 #456',
	addressLine2: null,
	city: 'Plaza',
	state: 'La Habana',
	postalCode: null,
	country: 'Cuba',
	createdAt: new Date().toISOString(),
	items: [],
};

const renderCheckoutPage = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={['/checkout']}>
				<Routes>
					<Route path='/checkout' element={<CheckoutPage />} />
					<Route path='/pedido-confirmado/:orderNumber' element={<div>Confirmación real</div>} />
					<Route path='/catalogo' element={<div>Catálogo</div>} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>
	);
};

// Completa los primeros 8 pasos con datos válidos y deja al usuario parado
// en el paso de pago, listo para confirmar.
const completeStepsBeforePayment = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText(/nombre completo/i), 'Juana Pérez');
	await user.type(screen.getByLabelText(/correo electrónico/i), 'juana@example.com');
	await user.type(screen.getByLabelText(/^teléfono\*?$/i), '+1 305 555 1234');
	await user.type(screen.getByLabelText(/país desde donde compras/i), 'Estados Unidos');
	await user.click(screen.getByRole('button', { name: 'Siguiente' }));

	await user.type(screen.getByLabelText(/^nombre completo del destinatario/i), 'Pedro Pérez');
	await user.type(screen.getByLabelText(/^teléfono del destinatario/i), '+53 5 123 4567');
	await user.click(screen.getByRole('button', { name: 'Siguiente' }));

	await user.type(screen.getByLabelText(/^calle y número/i), 'Calle 23 #456');
	await user.click(screen.getByRole('button', { name: 'Siguiente' }));

	await user.selectOptions(await screen.findByLabelText(/^provincia/i), 'La Habana');
	await user.selectOptions(screen.getByLabelText(/^municipio/i), 'Plaza');
	await user.click(screen.getByRole('button', { name: 'Siguiente' }));

	await user.type(screen.getByLabelText(/^punto de referencia cercano/i), 'Frente al parque');
	await user.click(screen.getByRole('button', { name: 'Siguiente' }));

	// Modalidad de entrega: se deja el valor por defecto (entrega a domicilio).
	await user.click(screen.getByRole('button', { name: 'Siguiente' }));

	// Instrucciones especiales: opcional, se deja en blanco.
	await user.click(screen.getByRole('button', { name: 'Siguiente' }));

	await user.click(screen.getByRole('checkbox', { name: /acepto las políticas/i }));
	await user.click(screen.getByRole('button', { name: 'Siguiente' }));

	// Método de pago: se deja el valor por defecto (efectivo al recibir).
	await screen.findByRole('heading', { name: 'Pago' });
};

describe('CheckoutPage', () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
		createOrderMock.mockReset();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ user: { id: 'user-1' } } as any);
		useAdminProvincesMock.mockReturnValue({
			provinces: [{ id: 'la-habana', name: 'La Habana' }],
			isLoading: false,
			isError: false,
		});
		useAdminMunicipalitiesMock.mockReturnValue({
			municipalities: [{ id: 'plaza', name: 'Plaza', provinceId: 'la-habana', deliveryFeeUsd: 0 }],
			isLoading: false,
			isError: false,
		});
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

	it('muestra un estado vacío con enlace al catálogo cuando el carrito está vacío', () => {
		renderCheckoutPage();

		expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /ir al catálogo/i })).toHaveAttribute('href', '/catalogo');
	});

	it('no avanza de paso y muestra los errores de validación si faltan datos', async () => {
		useCartStore.getState().addItem(arroz);
		renderCheckoutPage();

		const user = userEvent.setup();
		await user.click(screen.getByRole('button', { name: 'Siguiente' }));

		expect(await screen.findByText('El nombre completo es requerido')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Datos del comprador' })).toBeInTheDocument();
	});

	it('completa el flujo principal del checkout y navega a la confirmación', async () => {
		useCartStore.getState().addItem(arroz);
		createOrderMock.mockResolvedValueOnce(fakeOrder);
		renderCheckoutPage();

		const user = userEvent.setup();
		await completeStepsBeforePayment(user);

		await user.click(screen.getByRole('button', { name: 'Confirmar y pagar' }));

		expect(await screen.findByText('Confirmación real')).toBeInTheDocument();
		expect(createOrderMock).toHaveBeenCalledTimes(1);
		expect(createOrderMock).toHaveBeenCalledWith(
			expect.objectContaining({
				customerId: 'user-1',
				items: [{ productId: 'arroz', quantity: 2 }],
			})
		);
		expect(useCartStore.getState().items).toHaveLength(0);
	});

	it('muestra un error si la creación del pedido falla y permite reintentar', async () => {
		useCartStore.getState().addItem(arroz);
		createOrderMock.mockRejectedValueOnce(new Error('El producto: Arroz no se le puede dar salida'));
		createOrderMock.mockResolvedValueOnce(fakeOrder);
		renderCheckoutPage();

		const user = userEvent.setup();
		await completeStepsBeforePayment(user);

		const confirmButton = screen.getByRole('button', { name: 'Confirmar y pagar' });
		await user.click(confirmButton);

		expect(await screen.findByText('El producto: Arroz no se le puede dar salida')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Confirmar y pagar' }));

		expect(await screen.findByText('Confirmación real')).toBeInTheDocument();
		expect(createOrderMock).toHaveBeenCalledTimes(2);
	});

	it('evita el doble envío mientras el pedido se está creando', async () => {
		useCartStore.getState().addItem(arroz);
		let resolveSubmit: (order: CustomerOrder) => void = () => {};
		createOrderMock.mockReturnValueOnce(
			new Promise<CustomerOrder>(resolve => {
				resolveSubmit = resolve;
			})
		);
		renderCheckoutPage();

		const user = userEvent.setup();
		await completeStepsBeforePayment(user);

		const confirmButton = screen.getByRole('button', { name: 'Confirmar y pagar' });
		await user.click(confirmButton);
		// El botón queda deshabilitado mientras se procesa: un segundo click no dispara un segundo envío.
		await user.click(confirmButton);

		expect(createOrderMock).toHaveBeenCalledTimes(1);

		resolveSubmit(fakeOrder);
		expect(await screen.findByText('Confirmación real')).toBeInTheDocument();
	});

	it('bloquea el envío si el carrito tiene un combo', async () => {
		useCartStore.getState().addItem({ ...arroz, comboId: 'combo-1', comboName: 'Combo familiar' });
		renderCheckoutPage();

		const user = userEvent.setup();
		await completeStepsBeforePayment(user);

		await user.click(screen.getByRole('button', { name: 'Confirmar y pagar' }));

		expect(await screen.findByText(/los combos todavía no se pueden pagar/i)).toBeInTheDocument();
		expect(createOrderMock).not.toHaveBeenCalled();
	});
});
