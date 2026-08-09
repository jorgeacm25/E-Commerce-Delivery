import { apiFetch } from '../api/client';
import { WorkerResultDto } from '../api/types';
import { AdminWorker, AdminWorkerInput, AdminWorkerUpdateInput } from '../interfaces';

const mapWorker = (dto: WorkerResultDto): AdminWorker => ({
	id: dto.id ?? '',
	fullName: dto.fullName ?? '',
	role: dto.role ?? '',
	active: dto.active ?? true,
	pendingAmountUsd: dto.pendingAmountUsd ?? 0,
	createdAt: dto.createdAt ?? '',
});

export const getAdminWorkers = async (): Promise<AdminWorker[]> => {
	const workers = await apiFetch<WorkerResultDto[]>('/api/worker');
	return workers.map(mapWorker);
};

export const createWorker = async (input: AdminWorkerInput): Promise<void> => {
	await apiFetch('/api/worker', { method: 'POST', body: input });
};

export const updateWorker = async (id: string, input: AdminWorkerUpdateInput): Promise<void> => {
	await apiFetch('/api/worker', { method: 'PUT', body: { id, ...input } });
};

export const settleWorker = async (id: string): Promise<void> => {
	await apiFetch(`/api/worker/${id}/settle`, { method: 'POST' });
};
