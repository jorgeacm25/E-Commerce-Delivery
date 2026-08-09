import { apiFetch } from '../api/client';
import { ComboResultDto } from '../api/types';
import { AdminCombo, AdminComboInput } from '../interfaces';

export interface ComboActorIds {
	adminId?: string | null;
	userId?: string | null;
}

const mapCombo = (dto: ComboResultDto): AdminCombo => ({
	id: dto.id,
	name: dto.name,
	priceUsd: dto.salePriceUsd,
	discountPriceUsd: dto.discountPriceUsd,
	products: dto.products.map(product => ({
		id: product.id ?? '',
		name: product.nameProduct ?? '',
		quantity: product.quantity,
		unit: product.unity ?? '',
	})),
	createdByName: dto.nameUserOrAdmin ?? '',
});

export const getAdminCombos = async (): Promise<AdminCombo[]> => {
	const combos = await apiFetch<ComboResultDto[]>('/api/combo', { auth: false });
	return combos.map(mapCombo);
};

export const createCombo = async (
	input: AdminComboInput,
	actor: ComboActorIds
): Promise<AdminCombo> => {
	const created = await apiFetch<ComboResultDto>('/api/combo', {
		method: 'POST',
		body: {
			name: input.name,
			salePriceUsd: input.priceUsd,
			discountPriceUsd: input.discountPriceUsd,
			products: input.products,
			adminId: actor.adminId ?? null,
			userId: actor.userId ?? null,
		},
	});

	return mapCombo(created);
};

export const updateCombo = async (
	id: string,
	input: AdminComboInput,
	actor: ComboActorIds
): Promise<AdminCombo> => {
	const updated = await apiFetch<ComboResultDto>('/api/combo', {
		method: 'PUT',
		body: {
			id,
			name: input.name,
			salePriceUsd: input.priceUsd,
			discountPriceUsd: input.discountPriceUsd,
			productsIds: input.products,
			adminId: actor.adminId ?? null,
			userId: actor.userId ?? null,
		},
	});

	return mapCombo(updated);
};

// A diferencia de DELETE /user/{id} y DELETE /api/admin/{id} (sin body),
// este endpoint exige un body con el actor aunque el id ya vaya en la URL.
export const deleteCombo = async (id: string, actor: ComboActorIds): Promise<void> => {
	await apiFetch<void>(`/api/combo/${id}`, {
		method: 'DELETE',
		body: { adminId: actor.adminId ?? null, userId: actor.userId ?? null },
	});
};
