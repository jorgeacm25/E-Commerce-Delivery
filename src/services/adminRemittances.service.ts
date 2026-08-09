import { apiFetch } from '../api/client';
import { RemittanceResultDto } from '../api/types';
import { AdminRemittance, AdminRemittanceInput } from '../interfaces';

const mapRemittance = (dto: RemittanceResultDto): AdminRemittance => ({
	id: dto.id ?? '',
	customerId: dto.customerId,
	recipientName: dto.recipientName ?? '',
	amountUsd: dto.amountUsd ?? 0,
	amountCup: dto.amountCup ?? 0,
	status: dto.status ?? 'Pending',
	notes: dto.notes,
	createdAt: dto.createdAt ?? '',
});

export const getAdminRemittances = async (): Promise<AdminRemittance[]> => {
	const remittances = await apiFetch<RemittanceResultDto[]>('/api/remittance');
	return remittances.map(mapRemittance).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const createRemittance = async (input: AdminRemittanceInput): Promise<void> => {
	await apiFetch('/api/remittance', {
		method: 'POST',
		body: { customerId: null, ...input },
	});
};

export const updateRemittanceStatus = async ({ id, status }: { id: string; status: string }): Promise<void> => {
	await apiFetch(`/api/remittance/${id}/status`, { method: 'PUT', body: { id, status } });
};
