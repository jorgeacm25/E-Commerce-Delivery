import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createRemittance, getAdminRemittances, updateRemittanceStatus } from '../adminRemittances.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('adminRemittances.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAdminRemittances', () => {
		it('pide las remesas y las ordena de la más reciente a la más antigua', async () => {
			apiFetchMock.mockResolvedValue([
				{
					id: 'r-1',
					customerId: 'c-1',
					recipientName: 'María',
					amountUsd: 50,
					amountCup: 20000,
					status: 'Pending',
					notes: null,
					createdAt: '2026-01-01T00:00:00Z',
				},
				{
					id: 'r-2',
					customerId: null,
					recipientName: 'José',
					amountUsd: 30,
					amountCup: 12000,
					status: 'Sent',
					notes: 'urgente',
					createdAt: '2026-02-01T00:00:00Z',
				},
			]);

			const result = await getAdminRemittances();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/remittance');
			expect(result.map(r => r.id)).toEqual(['r-2', 'r-1']);
		});

		it('aplica valores por defecto cuando el backend devuelve campos nulos', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'r-1', customerId: null, recipientName: null, amountUsd: null, amountCup: null, status: null, notes: null, createdAt: null },
			]);

			const result = await getAdminRemittances();

			expect(result).toEqual([
				{ id: 'r-1', customerId: null, recipientName: '', amountUsd: 0, amountCup: 0, status: 'Pending', notes: null, createdAt: '' },
			]);
		});
	});

	describe('createRemittance', () => {
		it('crea la remesa con customerId nulo por defecto', async () => {
			apiFetchMock.mockResolvedValue(null);

			await createRemittance({ recipientName: 'María', amountUsd: 50, amountCup: 20000 });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/remittance', {
				method: 'POST',
				body: { customerId: null, recipientName: 'María', amountUsd: 50, amountCup: 20000 },
			});
		});
	});

	describe('updateRemittanceStatus', () => {
		it('actualiza el estado de la remesa', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updateRemittanceStatus({ id: 'r-1', status: 'Sent' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/remittance/r-1/status', {
				method: 'PUT',
				body: { id: 'r-1', status: 'Sent' },
			});
		});
	});
});
