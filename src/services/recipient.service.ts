import { apiFetch } from '../api/client';
import { CustomerRecipientResultDto } from '../api/types';
import { CustomerRecipient, CustomerRecipientInput } from '../interfaces';

// Destinatarios en Cuba, contra el backend .NET real (api/customerRecipient)
// — antes escribía a Supabase (`customer_recipients`, RLS `auth.uid() =
// profile_id`), rota desde que el login es 100% .NET (ver
// docs/PROJECT_STATE.md). Create/Update/Delete no devuelven la fila
// (Result<Unit>): el caller refresca el listado (ver useManageRecipients.ts).
const mapRecipient = (dto: CustomerRecipientResultDto): CustomerRecipient => ({
	id: dto.id ?? '',
	customerId: dto.customerId ?? '',
	fullName: dto.fullName ?? '',
	phone: dto.phone ?? '',
	nationalId: dto.nationalId,
	province: dto.province ?? '',
	municipality: dto.municipality ?? '',
	addressLine: dto.addressLine ?? '',
	notes: dto.notes,
	isDefault: dto.isDefault ?? false,
	createdAt: dto.createdAt ?? '',
	updatedAt: dto.updatedAt ?? '',
});

export const getRecipients = async (customerId: string): Promise<CustomerRecipient[]> => {
	const dtos = await apiFetch<CustomerRecipientResultDto[]>(`/api/customerRecipient/customer/${customerId}`);
	return dtos
		.map(mapRecipient)
		.sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || b.createdAt.localeCompare(a.createdAt));
};

export const createRecipient = async (customerId: string, input: CustomerRecipientInput): Promise<void> => {
	await apiFetch('/api/customerRecipient', {
		method: 'POST',
		body: {
			customerId,
			fullName: input.fullName,
			phone: input.phone,
			nationalId: input.nationalId ?? null,
			province: input.province,
			municipality: input.municipality,
			addressLine: input.addressLine,
			notes: input.notes ?? null,
			isDefault: input.isDefault ?? false,
		},
	});
};

export const updateRecipient = async (id: string, input: CustomerRecipientInput): Promise<void> => {
	await apiFetch('/api/customerRecipient', {
		method: 'PUT',
		body: {
			id,
			fullName: input.fullName,
			phone: input.phone,
			nationalId: input.nationalId ?? null,
			province: input.province,
			municipality: input.municipality,
			addressLine: input.addressLine,
			notes: input.notes ?? null,
			isDefault: input.isDefault ?? false,
		},
	});
};

export const deleteRecipient = async (id: string): Promise<void> => {
	await apiFetch(`/api/customerRecipient/${id}`, { method: 'DELETE' });
};
