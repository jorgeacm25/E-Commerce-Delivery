import { apiFetch } from '../api/client';
import { CustomerAddressResultDto } from '../api/types';
import { CustomerAddress, CustomerAddressInput } from '../interfaces';

// Libreta de direcciones real, contra el backend .NET (api/customerAddress)
// — antes escribía a Supabase (`customer_addresses`, RLS `auth.uid() =
// profile_id`), rota desde que el login es 100% .NET (ver
// docs/PROJECT_STATE.md). Create/Update/Delete no devuelven la fila
// (Result<Unit>): el caller debe refrescar el listado (ver
// useManageAddresses.ts, ya invalida ['addresses', customerId]).
const mapAddress = (dto: CustomerAddressResultDto): CustomerAddress => ({
	id: dto.id ?? '',
	customerId: dto.customerId ?? '',
	label: dto.label,
	province: dto.province ?? '',
	municipality: dto.municipality ?? '',
	addressLine: dto.addressLine ?? '',
	referenceNotes: dto.referenceNotes,
	isDefault: dto.isDefault ?? false,
	createdAt: dto.createdAt ?? '',
	updatedAt: dto.updatedAt ?? '',
});

export const getAddresses = async (customerId: string): Promise<CustomerAddress[]> => {
	const dtos = await apiFetch<CustomerAddressResultDto[]>(`/api/customerAddress/customer/${customerId}`);
	return dtos
		.map(mapAddress)
		.sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.createdAt.localeCompare(a.createdAt));
};

export const createAddress = async (customerId: string, input: CustomerAddressInput): Promise<void> => {
	await apiFetch('/api/customerAddress', {
		method: 'POST',
		body: {
			customerId,
			label: input.label ?? null,
			province: input.province,
			municipality: input.municipality,
			addressLine: input.addressLine,
			referenceNotes: input.referenceNotes ?? null,
			isDefault: input.isDefault ?? false,
		},
	});
};

export const updateAddress = async (id: string, input: CustomerAddressInput): Promise<void> => {
	await apiFetch('/api/customerAddress', {
		method: 'PUT',
		body: {
			id,
			label: input.label ?? null,
			province: input.province,
			municipality: input.municipality,
			addressLine: input.addressLine,
			referenceNotes: input.referenceNotes ?? null,
			isDefault: input.isDefault ?? false,
		},
	});
};

export const deleteAddress = async (id: string): Promise<void> => {
	await apiFetch(`/api/customerAddress/${id}`, { method: 'DELETE' });
};
