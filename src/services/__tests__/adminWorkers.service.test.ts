import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createWorker, getAdminWorkers, settleWorker, updateWorker } from '../adminWorkers.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('adminWorkers.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAdminWorkers', () => {
		it('pide los trabajadores y mapea sus campos con valores por defecto', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'w-1', fullName: 'Pedro', role: 'Repartidor', active: true, pendingAmountUsd: 20, createdAt: '2026-01-01' },
			]);

			const result = await getAdminWorkers();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/worker');
			expect(result).toEqual([
				{ id: 'w-1', fullName: 'Pedro', role: 'Repartidor', active: true, pendingAmountUsd: 20, createdAt: '2026-01-01' },
			]);
		});

		it('usa valores por defecto cuando el backend devuelve campos nulos', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'w-2', fullName: null, role: null, active: null, pendingAmountUsd: null, createdAt: null },
			]);

			const result = await getAdminWorkers();

			expect(result).toEqual([
				{ id: 'w-2', fullName: '', role: '', active: true, pendingAmountUsd: 0, createdAt: '' },
			]);
		});
	});

	describe('createWorker', () => {
		it('crea el trabajador con los datos ingresados', async () => {
			apiFetchMock.mockResolvedValue(null);

			await createWorker({ fullName: 'Pedro', role: 'Repartidor', pendingAmountUsd: 0 });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/worker', {
				method: 'POST',
				body: { fullName: 'Pedro', role: 'Repartidor', pendingAmountUsd: 0 },
			});
		});
	});

	describe('updateWorker', () => {
		it('actualiza el trabajador incluyendo el id', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updateWorker('w-1', { active: false });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/worker', {
				method: 'PUT',
				body: { id: 'w-1', active: false },
			});
		});
	});

	describe('settleWorker', () => {
		it('liquida el pago pendiente del trabajador', async () => {
			apiFetchMock.mockResolvedValue(null);

			await settleWorker('w-1');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/worker/w-1/settle', { method: 'POST' });
		});
	});
});
