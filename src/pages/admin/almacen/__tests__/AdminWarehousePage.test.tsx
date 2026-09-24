import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useAdminProducts,
	useRegisterProductIn,
	useRegisterProductOut,
	useStockAlerts,
	useWarehouseHistory,
} from '../../../../hooks';
import { AdminWarehousePage } from '../AdminWarehousePage';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return {
		...actual,
		useStockAlerts: vi.fn(),
		useWarehouseHistory: vi.fn(),
		useRegisterProductIn: vi.fn(),
		useRegisterProductOut: vi.fn(),
		useAdminProducts: vi.fn(),
	};
});

const useStockAlertsMock = vi.mocked(useStockAlerts);
const useWarehouseHistoryMock = vi.mocked(useWarehouseHistory);
const useRegisterProductInMock = vi.mocked(useRegisterProductIn);
const useRegisterProductOutMock = vi.mocked(useRegisterProductOut);
const useAdminProductsMock = vi.mocked(useAdminProducts);

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminWarehousePage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminWarehousePage', () => {
	const registerIn = vi.fn();
	const registerOut = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useStockAlertsMock.mockReturnValue({
			alerts: [
				{
					productId: 'p-1',
					productName: 'Arroz',
					stock: 5,
					unit: 'lb',
					endDate: null,
					daysUntilExpiration: null,
				},
			],
			isLoading: false,
			isError: false,
		});

		useWarehouseHistoryMock.mockReturnValue({
			history: [
				{
					id: 'h-1',
					actionType: 'Salida',
					userOrAdminUserName: 'Admin',
					description: 'Salida manual',
					createdAt: '2026-01-01T00:00:00Z',
				},
				{
					id: 'h-2',
					actionType: 'Creaciones',
					userOrAdminUserName: 'Admin',
					description: 'Producto creado',
					createdAt: '2026-01-02T00:00:00Z',
				},
			],
			isLoading: false,
			isError: false,
		});

		useRegisterProductInMock.mockReturnValue({
			mutate: registerIn,
			isPending: false,
		});

		useRegisterProductOutMock.mockReturnValue({
			mutate: registerOut,
			isPending: false,
		});

		useAdminProductsMock.mockReturnValue({
			products: [{ id: 'p-1', name: 'Arroz', stock: 5, unit: 'lb', provider: 'Proveedor X' } as never],
			total: 1,
			totalPages: 1,
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
	});

	it('muestra las alertas de stock y el historial de movimientos', () => {
		renderPage();

		expect(screen.getByText('Arroz')).toBeInTheDocument();
		expect(screen.getByText('Salida manual')).toBeInTheDocument();
	});

	it('muestra los estados de carga mientras llegan los datos', () => {
		useStockAlertsMock.mockReturnValue({ alerts: [], isLoading: true, isError: false });
		useWarehouseHistoryMock.mockReturnValue({ history: [], isLoading: true, isError: false });

		renderPage();

		expect(screen.queryByText('Sin alertas')).not.toBeInTheDocument();
		expect(screen.queryByText('Sin movimientos')).not.toBeInTheDocument();
	});

	it('abre el modal y registra una salida de producto', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /registrar salida/i }));

		await user.selectOptions(screen.getByLabelText(/^producto\*?$/i), 'p-1');
		await user.type(screen.getByLabelText(/^cantidad\*?$/i), '2');
		await user.type(screen.getByLabelText(/^motivo\*?$/i), 'merma');

		await user.click(screen.getByRole('button', { name: /^registrar$/i }));

		expect(registerOut).toHaveBeenCalledTimes(1);
		expect(registerOut.mock.calls[0][0]).toEqual({
			productId: 'p-1',
			quantity: 2,
			motive: 'merma',
			customer: undefined,
		});
	});

	it('abre el modal y registra una entrada con el proveedor prellenado', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /registrar entrada/i }));

		await user.selectOptions(screen.getByLabelText(/^producto\*?$/i), 'p-1');
		await user.type(screen.getByLabelText(/^cantidad a ingresar\*?$/i), '7');

		await user.click(screen.getByRole('button', { name: /^registrar$/i }));

		expect(registerIn).toHaveBeenCalledTimes(1);
		expect(registerIn.mock.calls[0][0]).toEqual({
			productId: 'p-1',
			quantity: 7,
			provider: 'Proveedor X',
			endDate: undefined,
		});
	});

	it('por defecto muestra solo entradas/salidas y permite ver todo el histórico', async () => {
		const user = userEvent.setup();
		renderPage();

		// Por defecto: solo movimientos de stock (Entrada/Salida).
		expect(screen.getByText('Salida manual')).toBeInTheDocument();
		expect(screen.queryByText('Producto creado')).not.toBeInTheDocument();

		await user.selectOptions(screen.getByLabelText('Filtrar historial por tipo'), 'all');

		expect(screen.getByText('Producto creado')).toBeInTheDocument();
	});

	it('muestra el tipo de movimiento como badge', () => {
		renderPage();

		expect(screen.getByText('Salida')).toBeInTheDocument();
	});
});
