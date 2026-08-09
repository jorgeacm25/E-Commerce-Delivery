import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getMunicipalities, getProvinces, updateMunicipalityDeliveryFee } from '../adminDeliveryZones.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('adminDeliveryZones.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getProvinces', () => {
		it('pide las provincias y las ordena por nombre', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'pr-2', name: 'La Habana' },
				{ id: 'pr-1', name: 'Artemisa' },
			]);

			const result = await getProvinces();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/province', { auth: false });
			expect(result).toEqual([
				{ id: 'pr-1', name: 'Artemisa' },
				{ id: 'pr-2', name: 'La Habana' },
			]);
		});
	});

	describe('getMunicipalities', () => {
		it('pide los municipios y los ordena por nombre', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'm-2', name: 'Plaza', provinceId: 'pr-2', deliveryFeeUsd: 3 },
				{ id: 'm-1', name: 'Consolación', provinceId: 'pr-1', deliveryFeeUsd: 2 },
			]);

			const result = await getMunicipalities();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/municipality', { auth: false });
			expect(result).toEqual([
				{ id: 'm-1', name: 'Consolación', provinceId: 'pr-1', deliveryFeeUsd: 2 },
				{ id: 'm-2', name: 'Plaza', provinceId: 'pr-2', deliveryFeeUsd: 3 },
			]);
		});
	});

	describe('updateMunicipalityDeliveryFee', () => {
		it('actualiza la tarifa de domicilio del municipio', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updateMunicipalityDeliveryFee('m-1', 5.5);

			expect(apiFetchMock).toHaveBeenCalledWith('/api/municipality', {
				method: 'PUT',
				body: { id: 'm-1', deliveryFeeUsd: 5.5 },
			});
		});
	});
});
