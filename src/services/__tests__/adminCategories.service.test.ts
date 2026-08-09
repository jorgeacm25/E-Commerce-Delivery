import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	createCategory,
	deleteCategory,
	getAdminCategories,
	updateCategory,
} from '../adminCategories.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('adminCategories.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAdminCategories', () => {
		it('pide las categorías al backend y las ordena por nombre', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'cat-2', slug: 'dulces', name: 'Dulces' },
				{ id: 'cat-1', slug: 'carnes', name: 'Carnes' },
			]);

			const result = await getAdminCategories();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/category', { auth: false });
			expect(result).toEqual([
				{ id: 'cat-1', slug: 'carnes', name: 'Carnes' },
				{ id: 'cat-2', slug: 'dulces', name: 'Dulces' },
			]);
		});
	});

	describe('createCategory', () => {
		it('crea la categoría con nombre y slug', async () => {
			apiFetchMock.mockResolvedValue({ id: 'cat-2', slug: 'dulces', name: 'Dulces' });

			const result = await createCategory({ slug: 'dulces', name: 'Dulces' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/category', {
				method: 'POST',
				body: { name: 'Dulces', slug: 'dulces' },
			});
			expect(result.slug).toBe('dulces');
		});
	});

	describe('updateCategory', () => {
		it('actualiza y devuelve la categoría', async () => {
			apiFetchMock.mockResolvedValue({ id: 'cat-1', slug: 'carnes', name: 'Carnes rojas' });

			const result = await updateCategory('cat-1', { slug: 'carnes', name: 'Carnes rojas' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/category', {
				method: 'PUT',
				body: { id: 'cat-1', name: 'Carnes rojas', slug: 'carnes' },
			});
			expect(result.name).toBe('Carnes rojas');
		});
	});

	describe('deleteCategory', () => {
		it('elimina la categoría por id', async () => {
			apiFetchMock.mockResolvedValue(null);

			await expect(deleteCategory('cat-1')).resolves.toBeUndefined();
			expect(apiFetchMock).toHaveBeenCalledWith('/api/category/cat-1', { method: 'DELETE' });
		});
	});
});
