import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	createAdminAccount,
	deleteAdminAccount,
	getAdminAccounts,
	resetAdminAccountPassword,
} from '../adminAccounts.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('adminAccounts.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAdminAccounts', () => {
		it('junta administradores y staff en una sola lista, más reciente primero', async () => {
			apiFetchMock.mockImplementation((path: string) => {
				if (path === '/api/admin') {
					return Promise.resolve([
						{ id: 'admin-1', userName: 'root', fullName: 'Root Admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: null },
					]);
				}
				if (path === '/user') {
					return Promise.resolve([
						{ id: 'user-1', userName: 'staff1', fullName: 'Staff Uno', createdAt: '2026-02-01T00:00:00Z', updatedAt: null },
					]);
				}
				return Promise.resolve([]);
			});

			const result = await getAdminAccounts();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/admin');
			expect(apiFetchMock).toHaveBeenCalledWith('/user');
			expect(result).toEqual([
				{ id: 'user-1', fullName: 'Staff Uno', userName: 'staff1', accountType: 'user', createdAt: '2026-02-01T00:00:00Z', updatedAt: null },
				{ id: 'admin-1', fullName: 'Root Admin', userName: 'root', accountType: 'admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: null },
			]);
		});
	});

	describe('createAdminAccount', () => {
		it('crea un admin raíz contra /api/admin', async () => {
			apiFetchMock.mockResolvedValue(null);

			await createAdminAccount({ accountType: 'admin', fullName: 'Root Admin', userName: 'root', password: 'secret123' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/admin', {
				method: 'POST',
				body: { fullName: 'Root Admin', userName: 'root', password: 'secret123' },
			});
		});

		it('crea una cuenta de staff contra /user', async () => {
			apiFetchMock.mockResolvedValue(null);

			await createAdminAccount({ accountType: 'user', fullName: 'Staff Uno', userName: 'staff1', password: 'secret123' });

			expect(apiFetchMock).toHaveBeenCalledWith('/user', {
				method: 'POST',
				body: { fullName: 'Staff Uno', userName: 'staff1', password: 'secret123' },
			});
		});
	});

	describe('resetAdminAccountPassword', () => {
		it('restablece la contraseña de un admin contra /api/admin', async () => {
			apiFetchMock.mockResolvedValue(null);

			await resetAdminAccountPassword('admin-1', 'admin', 'newpass123');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/admin', {
				method: 'PUT',
				body: { id: 'admin-1', password: 'newpass123' },
			});
		});

		it('restablece la contraseña de un staff contra /user', async () => {
			apiFetchMock.mockResolvedValue(null);

			await resetAdminAccountPassword('user-1', 'user', 'newpass123');

			expect(apiFetchMock).toHaveBeenCalledWith('/user', {
				method: 'PUT',
				body: { id: 'user-1', password: 'newpass123' },
			});
		});
	});

	describe('deleteAdminAccount', () => {
		it('elimina un admin contra /api/admin/{id}', async () => {
			apiFetchMock.mockResolvedValue(null);

			await deleteAdminAccount('admin-1', 'admin');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/admin/admin-1', { method: 'DELETE' });
		});

		it('elimina un staff contra /user/{id}', async () => {
			apiFetchMock.mockResolvedValue(null);

			await deleteAdminAccount('user-1', 'user');

			expect(apiFetchMock).toHaveBeenCalledWith('/user/user-1', { method: 'DELETE' });
		});
	});
});
