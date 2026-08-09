import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createPaymentAccount, getPaymentAccounts, updatePaymentAccount } from '../paymentAccounts.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('paymentAccounts.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getPaymentAccounts', () => {
		it('pide las cuentas de cobro y las ordena por prioridad', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'a-2', tipo: 'paypal', titular: 'Tienda', referencia: 'tienda@paypal.com', activa: true, prioridad: 2, createdAt: '2026-01-01' },
				{ id: 'a-1', tipo: 'zelle', titular: 'Tienda', referencia: 'tienda@zelle.com', activa: true, prioridad: 1, createdAt: '2026-01-01' },
			]);

			const result = await getPaymentAccounts();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/paymentAccount', { auth: false });
			expect(result.map(a => a.id)).toEqual(['a-1', 'a-2']);
		});

		it('aplica valores por defecto cuando el backend devuelve campos nulos', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'a-1', tipo: null, titular: null, referencia: null, activa: null, prioridad: null, createdAt: null },
			]);

			const result = await getPaymentAccounts();

			expect(result).toEqual([
				{ id: 'a-1', tipo: '', titular: '', referencia: '', activa: false, prioridad: 0, createdAt: '' },
			]);
		});
	});

	describe('createPaymentAccount', () => {
		it('crea la cuenta de cobro con los datos ingresados', async () => {
			apiFetchMock.mockResolvedValue(null);

			await createPaymentAccount({ tipo: 'zelle', titular: 'Tienda', referencia: 'tienda@zelle.com', prioridad: 1 });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/paymentAccount', {
				method: 'POST',
				body: { tipo: 'zelle', titular: 'Tienda', referencia: 'tienda@zelle.com', prioridad: 1 },
			});
		});
	});

	describe('updatePaymentAccount', () => {
		it('no expone borrado — solo actualiza (incluye activar/desactivar vía activa)', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updatePaymentAccount('a-1', { activa: false });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/paymentAccount', {
				method: 'PUT',
				body: { id: 'a-1', activa: false },
			});
		});
	});
});
