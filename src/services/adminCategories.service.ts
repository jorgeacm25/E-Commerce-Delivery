import { apiFetch } from '../api/client';
import { AdminCategory, AdminCategoryInput } from '../interfaces';

export const getAdminCategories = async (): Promise<AdminCategory[]> => {
	const categories = await apiFetch<AdminCategory[]>('/api/category', { auth: false });
	return [...categories].sort((a, b) => a.name.localeCompare(b.name));
};

export const createCategory = async (input: AdminCategoryInput): Promise<AdminCategory> => {
	return apiFetch<AdminCategory>('/api/category', {
		method: 'POST',
		body: { name: input.name, slug: input.slug },
	});
};

export const updateCategory = async (
	id: string,
	input: AdminCategoryInput
): Promise<AdminCategory> => {
	return apiFetch<AdminCategory>('/api/category', {
		method: 'PUT',
		body: { id, name: input.name, slug: input.slug },
	});
};

// El backend valida server-side que la categoría no tenga productos
// asociados antes de eliminarla (a diferencia de la versión anterior sobre
// Supabase, que hacía esa verificación a mano en el cliente).
export const deleteCategory = async (id: string): Promise<void> => {
	await apiFetch<void>(`/api/category/${id}`, { method: 'DELETE' });
};
