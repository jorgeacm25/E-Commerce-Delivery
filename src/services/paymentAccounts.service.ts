import { apiFetch } from '../api/client';
import { PaymentAccountResultDto } from '../api/types';
import { AdminPaymentAccount, AdminPaymentAccountInput, AdminPaymentAccountUpdateInput } from '../interfaces';

const mapAccount = (dto: PaymentAccountResultDto): AdminPaymentAccount => ({
	id: dto.id ?? '',
	tipo: dto.tipo ?? '',
	titular: dto.titular ?? '',
	referencia: dto.referencia ?? '',
	activa: dto.activa ?? false,
	prioridad: dto.prioridad ?? 0,
	createdAt: dto.createdAt ?? '',
});

export const getPaymentAccounts = async (): Promise<AdminPaymentAccount[]> => {
	const accounts = await apiFetch<PaymentAccountResultDto[]>('/api/paymentAccount', { auth: false });
	return accounts.map(mapAccount).sort((a, b) => a.prioridad - b.prioridad);
};

export const createPaymentAccount = async (input: AdminPaymentAccountInput): Promise<void> => {
	await apiFetch('/api/paymentAccount', { method: 'POST', body: input });
};

// El backend no tiene endpoint de borrado — solo Update (incluye
// activar/desactivar vía `activa`).
export const updatePaymentAccount = async (id: string, input: AdminPaymentAccountUpdateInput): Promise<void> => {
	await apiFetch('/api/paymentAccount', { method: 'PUT', body: { id, ...input } });
};
