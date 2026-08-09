import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminMunicipalities, useAdminProvinces, useManageDeliveryZones } from '../../../../hooks';
import { AdminDeliveryZonesPage } from '../AdminDeliveryZonesPage';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return {
		...actual,
		useAdminProvinces: vi.fn(),
		useAdminMunicipalities: vi.fn(),
		useManageDeliveryZones: vi.fn(),
	};
});

const useAdminProvincesMock = vi.mocked(useAdminProvinces);
const useAdminMunicipalitiesMock = vi.mocked(useAdminMunicipalities);
const useManageDeliveryZonesMock = vi.mocked(useManageDeliveryZones);

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminDeliveryZonesPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminDeliveryZonesPage', () => {
	const updateFee = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useAdminProvincesMock.mockReturnValue({
			provinces: [
				{ id: 'pr-1', name: 'Artemisa' },
				{ id: 'pr-2', name: 'La Habana' },
			],
			isLoading: false,
			isError: false,
		});

		useAdminMunicipalitiesMock.mockReturnValue({
			municipalities: [
				{ id: 'm-1', name: 'Consolación', provinceId: 'pr-1', deliveryFeeUsd: 2 },
				{ id: 'm-2', name: 'Plaza', provinceId: 'pr-2', deliveryFeeUsd: 3 },
			],
			isLoading: false,
			isError: false,
		});

		useManageDeliveryZonesMock.mockReturnValue({ updateFee, isUpdatingFee: false });
	});

	it('lista los municipios con su provincia y tarifa', () => {
		renderPage();

		expect(screen.getByText('Consolación')).toBeInTheDocument();
		expect(screen.getByText('Plaza')).toBeInTheDocument();
		expect(screen.getAllByText('Artemisa').length).toBeGreaterThan(0);
	});

	it('filtra los municipios por provincia', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.selectOptions(screen.getByLabelText(/filtrar por provincia/i), 'pr-1');

		expect(screen.getByText('Consolación')).toBeInTheDocument();
		expect(screen.queryByText('Plaza')).not.toBeInTheDocument();
	});

	it('filtra los municipios por texto de búsqueda', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.type(screen.getByPlaceholderText(/buscar municipio/i), 'plaza');

		expect(screen.queryByText('Consolación')).not.toBeInTheDocument();
		expect(screen.getByText('Plaza')).toBeInTheDocument();
	});

	it('actualiza la tarifa de domicilio de un municipio', async () => {
		const user = userEvent.setup();
		renderPage();

		const feeInputs = screen.getAllByLabelText(/tarifa de domicilio en usd/i);
		await user.clear(feeInputs[0]);
		await user.type(feeInputs[0], '4.5');

		await user.click(screen.getAllByRole('button', { name: /guardar tarifa/i })[0]);

		expect(updateFee).toHaveBeenCalledWith({ id: 'm-1', deliveryFeeUsd: 4.5 });
	});
});
