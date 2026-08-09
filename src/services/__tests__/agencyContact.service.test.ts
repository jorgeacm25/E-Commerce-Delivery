import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getActiveAgencyContact, updateAgencyContact } from '../agencyContact.service';
import { ApiError } from '../../api/client';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', async () => {
	const actual = await vi.importActual<typeof import('../../api/client')>('../../api/client');
	return { ...actual, apiFetch: (...args: unknown[]) => apiFetchMock(...args) };
});

describe('agencyContact.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getActiveAgencyContact', () => {
		it('pide el contacto vigente al backend y lo mapea', async () => {
			apiFetchMock.mockResolvedValue({
				id: 'contact-1',
				whatsappPhone: '+53 5555 5555',
				vigenteDesde: '2026-01-01T00:00:00Z',
				creadoPorAdminId: 'admin-1',
			});

			const result = await getActiveAgencyContact();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/agencyContact/active', { auth: false });
			expect(result).toEqual({
				id: 'contact-1',
				whatsappPhone: '+53 5555 5555',
				vigenteDesde: '2026-01-01T00:00:00Z',
				creadoPorAdminId: 'admin-1',
			});
		});

		it('devuelve null cuando el backend responde 404 (todavía no hay datos configurados)', async () => {
			apiFetchMock.mockRejectedValue(new ApiError(404, 'not found', null));

			const result = await getActiveAgencyContact();

			expect(result).toBeNull();
		});

		it('propaga otros errores distintos de 404', async () => {
			apiFetchMock.mockRejectedValue(new ApiError(500, 'server error', null));

			await expect(getActiveAgencyContact()).rejects.toThrow('server error');
		});
	});

	describe('updateAgencyContact', () => {
		it('crea un nuevo registro de contacto con el adminId del actor', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updateAgencyContact('+53 5555 9999', 'admin-1');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/agencyContact', {
				method: 'POST',
				body: { whatsappPhone: '+53 5555 9999', creadoPorAdminId: 'admin-1' },
			});
		});

		it('manda creadoPorAdminId null cuando no se pasa actor', async () => {
			apiFetchMock.mockResolvedValue(null);

			await updateAgencyContact('+53 5555 9999');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/agencyContact', {
				method: 'POST',
				body: { whatsappPhone: '+53 5555 9999', creadoPorAdminId: null },
			});
		});
	});
});
