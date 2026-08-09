import Decimal from 'decimal.js';
import { apiFetch } from '../api/client';
import { CommissionResultDto, SellerResultDto } from '../api/types';
import { AdminCommission, AdminSeller, AdminSellerInput, AdminSellerUpdateInput } from '../interfaces';

const mapCommission = (dto: CommissionResultDto): AdminCommission => ({
	id: dto.id ?? '',
	sellerId: dto.sellerId ?? '',
	orderId: dto.orderId ?? '',
	amountUsd: dto.amountUsd ?? 0,
	status: dto.status ?? 'Pending',
	settledAt: dto.settledAt,
	createdAt: dto.createdAt ?? '',
});

export const getAdminSellers = async (): Promise<AdminSeller[]> => {
	const [sellers, commissions] = await Promise.all([
		apiFetch<SellerResultDto[]>('/api/seller'),
		apiFetch<CommissionResultDto[]>('/api/commission'),
	]);

	return sellers.map((seller): AdminSeller => {
		const pendingCommissionUsd = commissions
			.filter(c => c.sellerId === seller.id && c.status === 'Pending')
			.reduce((acc, c) => acc.plus(new Decimal(c.amountUsd ?? 0)), new Decimal(0))
			.toDecimalPlaces(2)
			.toNumber();

		return {
			id: seller.id ?? '',
			fullName: seller.fullName ?? '',
			phone: seller.phone ?? '',
			commissionPercentage: seller.commissionPercentage ?? 0,
			active: seller.active ?? true,
			pendingCommissionUsd,
			createdAt: seller.createdAt ?? '',
		};
	});
};

export const getCommissionsBySeller = async (sellerId: string): Promise<AdminCommission[]> => {
	const commissions = await apiFetch<CommissionResultDto[]>('/api/commission');
	return commissions.filter(c => c.sellerId === sellerId).map(mapCommission);
};

export const createSeller = async (input: AdminSellerInput): Promise<void> => {
	await apiFetch('/api/seller', { method: 'POST', body: input });
};

export const updateSeller = async (id: string, input: AdminSellerUpdateInput): Promise<void> => {
	await apiFetch('/api/seller', { method: 'PUT', body: { id, ...input } });
};

export const settleSellerCommissions = async (sellerId: string): Promise<{ settledCount: number }> => {
	return apiFetch(`/api/commission/${sellerId}/settle`, { method: 'POST' });
};
