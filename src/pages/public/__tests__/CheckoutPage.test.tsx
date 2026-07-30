import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ICartItem } from '../../../components/shared/CartItem';
import { SimulatedOrder } from '../../../interfaces';
import { useCartStore } from '../../../store/cart.store';
import { CheckoutPage } from '../CheckoutPage';
import * as checkoutSimulationService from '../../../services/checkoutSimulation.service';

vi.mock('../../../services/checkoutSimulation.service', () => ({
	submitSimulatedOrder: vi.fn(),
}));

const submitSimulatedOrderMock = vi.mocked(checkoutSimulationService.submitSimulatedOrder);

const arroz: ICartItem = {
	variantId: 'arroz-5lb',
	productId: 'arroz',
	name: 'Arroz',
	variantLabel: '5 lb',
	price: 5.9,
	quantity: 2,
	image: '/arroz.jpg',
};

const fakeOrder: SimulatedOrder = {
	orderNumber: 'DH-000001',
	createdAt: new Date().toISOString(),
	buyer: { fullName: 'Juana Pérez', email: 'juana@example.com', phone: '+1 305 555 1234', country: 'Estados Unidos' },
	recipient: { fullName: 'Pedro Pérez', phone: '+53 5 123 4567', relationship: '' },
	address: { addressLine1: 'Calle 23 #456', addressLine2: '' },
	location: { provinceId: 'la-habana', municipality: 'Plaza' },
	references: { referencePoint: 'Frente al parque', alternatePhone: '' },
	deliveryModality: 'home_delivery',
	paymentMethod: 'cash_on_delivery',
	items: [],
	totals: { subtotal: 11.8, discount: 0, deliveryCost: 5, total: 16.8 },
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
					<Route path='/pedido-confirmado/:orderNumber' element={<div>Confirmación simulada</div>} />
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
		submitSimulatedOrderMock.mockReset();
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
		submitSimulatedOrderMock.mockResolvedValueOnce(fakeOrder);
		renderCheckoutPage();

		const user = userEvent.setup();
		await completeStepsBeforePayment(user);

		await user.click(screen.getByRole('button', { name: 'Confirmar y pagar' }));

		expect(await screen.findByText('Confirmación simulada')).toBeInTheDocument();
		expect(submitSimulatedOrderMock).toHaveBeenCalledTimes(1);
		expect(useCartStore.getState().items).toHaveLength(0);
	});

	it('muestra un error si la simulación de pago falla y permite reintentar', async () => {
		useCartStore.getState().addItem(arroz);
		submitSimulatedOrderMock.mockRejectedValueOnce(new Error('Fallo simulado de pago'));
		submitSimulatedOrderMock.mockResolvedValueOnce(fakeOrder);
		renderCheckoutPage();

		const user = userEvent.setup();
		await completeStepsBeforePayment(user);

		const confirmButton = screen.getByRole('button', { name: 'Confirmar y pagar' });
		await user.click(confirmButton);

		expect(await screen.findByText('Fallo simulado de pago')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Confirmar y pagar' }));

		expect(await screen.findByText('Confirmación simulada')).toBeInTheDocument();
		expect(submitSimulatedOrderMock).toHaveBeenCalledTimes(2);
	});

	it('evita el doble envío mientras el pago simulado está en proceso', async () => {
		useCartStore.getState().addItem(arroz);
		let resolveSubmit: (order: SimulatedOrder) => void = () => {};
		submitSimulatedOrderMock.mockReturnValueOnce(
			new Promise<SimulatedOrder>(resolve => {
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

		expect(submitSimulatedOrderMock).toHaveBeenCalledTimes(1);

		resolveSubmit(fakeOrder);
		expect(await screen.findByText('Confirmación simulada')).toBeInTheDocument();
	});
});
