import { apiFetch } from '../api/client';
import { AdminResultDto, UserResultDto } from '../api/types';
import { AdminAccount, AdminAccountInput } from '../interfaces';

const mapAdmin = (dto: AdminResultDto): AdminAccount => ({
	id: dto.id ?? '',
	fullName: dto.fullName ?? '',
	userName: dto.userName ?? '',
	accountType: 'admin',
	createdAt: dto.createdAt,
	updatedAt: dto.updatedAt,
});

const mapUser = (dto: UserResultDto): AdminAccount => ({
	id: dto.id ?? '',
	fullName: dto.fullName ?? '',
	userName: dto.userName ?? '',
	accountType: 'user',
	createdAt: dto.createdAt,
	updatedAt: dto.updatedAt,
});

// Junta las dos listas del backend (Admin raíz y User staff, ver
// src/api/auth.ts) en una sola tabla, más reciente primero.
export const getAdminAccounts = async (): Promise<AdminAccount[]> => {
	const [admins, users] = await Promise.all([
		apiFetch<AdminResultDto[]>('/api/admin'),
		apiFetch<UserResultDto[]>('/user'),
	]);

	return [...admins.map(mapAdmin), ...users.map(mapUser)].sort((a, b) =>
		(b.createdAt ?? '').localeCompare(a.createdAt ?? '')
	);
};

// POST /api/admin crea un Admin raíz (permisos completos, puede gestionar
// otras cuentas); POST /user crea un User staff normal. Mismo shape de
// body en ambos endpoints.
export const createAdminAccount = async ({
	accountType,
	fullName,
	userName,
	password,
}: AdminAccountInput): Promise<void> => {
	const path = accountType === 'admin' ? '/api/admin' : '/user';
	await apiFetch(path, { method: 'POST', body: { fullName, userName, password } });
};
