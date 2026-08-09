import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePerformanceSummary } from '../../../../hooks';
import { AdminPerformancePage } from '../AdminPerformancePage';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return { ...actual, usePerformanceSummary: vi.fn() };
});

const usePerformanceSummaryMock = vi.mocked(usePerformanceSummary);

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminPerformancePage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminPerformancePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('muestra las estadísticas generales y las tablas de productos y vendedores', () => {
		usePerformanceSummaryMock.mockReturnValue({
			summary: {
				totalSalesUsd: 150.5,
				totalOrders: 6,
				avgTicketUsd: 25.08,
				topProducts: [{ productId: 'p-1', productName: 'Arroz', quantitySold: 10, revenueUsd: 100 }],
				sellerPerformance: [
					{ sellerId: 's-1', fullName: 'Juan', totalCommissionUsd: 15, pendingCommissionUsd: 5, settledCommissionUsd: 10 },
				],
			},
			isLoading: false,
			isError: false,
		});

		renderPage();

		expect(screen.getByText('$150.50')).toBeInTheDocument();
		expect(screen.getByText('6')).toBeInTheDocument();
		expect(screen.getByText('Arroz')).toBeInTheDocument();
		expect(screen.getByText('Juan')).toBeInTheDocument();
	});

	it('muestra los estados de carga mientras llega el resumen', () => {
		usePerformanceSummaryMock.mockReturnValue({
			summary: undefined,
			isLoading: true,
			isError: false,
		});

		renderPage();

		expect(screen.queryByText('Sin ventas todavía')).not.toBeInTheDocument();
		expect(screen.queryByText('Sin vendedores todavía')).not.toBeInTheDocument();
	});

	it('muestra los estados vacíos cuando no hay ventas ni vendedores', () => {
		usePerformanceSummaryMock.mockReturnValue({
			summary: { totalSalesUsd: 0, totalOrders: 0, avgTicketUsd: 0, topProducts: [], sellerPerformance: [] },
			isLoading: false,
			isError: false,
		});

		renderPage();

		expect(screen.getByText('Sin ventas todavía')).toBeInTheDocument();
		expect(screen.getByText('Sin vendedores todavía')).toBeInTheDocument();
	});
});
