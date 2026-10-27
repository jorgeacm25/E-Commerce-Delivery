import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useActiveExchangeRate,
	useAdminCategories,
	useAdminProduct,
	useManageProducts,
} from '../../../../hooks';
import { AdminProductFormPage } from '../AdminProductFormPage';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return {
		...actual,
		useAdminCategories: vi.fn(),
		useAdminProduct: vi.fn(),
		useManageProducts: vi.fn(),
		useActiveExchangeRate: vi.fn(),
	};
});

const useAdminCategoriesMock = vi.mocked(useAdminCategories);
const useAdminProductMock = vi.mocked(useAdminProduct);
const useManageProductsMock = vi.mocked(useManageProducts);
const useActiveExchangeRateMock = vi.mocked(useActiveExchangeRate);

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={['/admin/productos/nuevo']}>
				<Routes>
					<Route path='/admin/productos/nuevo' element={<AdminProductFormPage />} />
				</Routes>
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminProductFormPage', () => {
	const create = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useAdminCategoriesMock.mockReturnValue({
			categories: [{ id: 'cat-1', slug: 'despensa', name: 'Despensa' }],
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});

		useAdminProductMock.mockReturnValue({ product: undefined, isLoading: false, isError: false });

		useManageProductsMock.mockReturnValue({
			create,
			isCreating: false,
			update: vi.fn(),
			isUpdating: false,
		});

		useActiveExchangeRateMock.mockReturnValue({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data: { valor_cup_por_usd: 400 } as any,
			isLoading: false,
		});
	});

	it('en modo fijo muestra el precio y el precio de compra (opcional) y oculta el margen', () => {
		renderPage();

		expect(screen.getByLabelText(/^precio \(usd\)\*?$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/precio de compra \(cup\)/i)).toBeInTheDocument();
		expect(screen.queryByLabelText(/margen \(usd\)/i)).not.toBeInTheDocument();
	});

	it('en modo automático calcula el precio a partir del precio de compra y margen USD', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByLabelText(/calcular automático/i));

		await user.type(screen.getByLabelText(/precio de compra \(cup\)/i), '400');
		await user.type(screen.getByLabelText(/margen \(usd\)/i), '0.5');

		// (400 / 400) + 0.5 = 1.50
		expect(await screen.findByText('$1.50')).toBeInTheDocument();
	});

	it('bloquea el envío si no se agregó ninguna imagen', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByLabelText(/^nombre\*?$/i), 'Arroz');
		await user.selectOptions(screen.getByLabelText(/^categoría\*?$/i), 'cat-1');
		await user.type(screen.getByLabelText(/^unidad\*?$/i), 'unidad');
		await user.type(screen.getByLabelText(/^proveedor\*?$/i), 'Proveedor Demo');
		await user.type(screen.getByLabelText(/^vencimiento\*?$/i), '2026-12-01');
		await user.type(screen.getByLabelText(/^precio \(usd\)\*?$/i), '5.9');

		await user.click(screen.getByRole('button', { name: /^guardar$/i }));

		expect(await screen.findByText(/agrega al menos una imagen/i)).toBeInTheDocument();
		expect(create).not.toHaveBeenCalled();
	});
});
