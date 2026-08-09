import { apiFetch } from '../api/client';
import { MunicipalityResultDto, ProvinceResultDto } from '../api/types';
import { AdminMunicipality, AdminProvince } from '../interfaces';

export const getProvinces = async (): Promise<AdminProvince[]> => {
	const provinces = await apiFetch<ProvinceResultDto[]>('/api/province', { auth: false });
	return provinces
		.map((dto): AdminProvince => ({ id: dto.id ?? '', name: dto.name ?? '' }))
		.sort((a, b) => a.name.localeCompare(b.name));
};

export const getMunicipalities = async (): Promise<AdminMunicipality[]> => {
	const municipalities = await apiFetch<MunicipalityResultDto[]>('/api/municipality', { auth: false });
	return municipalities
		.map(
			(dto): AdminMunicipality => ({
				id: dto.id ?? '',
				name: dto.name ?? '',
				provinceId: dto.provinceId ?? '',
				deliveryFeeUsd: dto.deliveryFeeUsd,
			})
		)
		.sort((a, b) => a.name.localeCompare(b.name));
};

export const updateMunicipalityDeliveryFee = async (
	id: string,
	deliveryFeeUsd: number
): Promise<void> => {
	await apiFetch('/api/municipality', { method: 'PUT', body: { id, deliveryFeeUsd } });
};
