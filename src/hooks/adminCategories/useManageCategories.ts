import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminCategoryInput } from '../../interfaces';
import {
	createCategory,
	deleteCategory,
	updateCategory,
} from '../../services/adminCategories.service';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageCategories = () => {
	const queryClient = useQueryClient();
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] });

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminCategoryInput) => createCategory(input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Categoría creada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: AdminCategoryInput }) =>
			updateCategory(id, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Categoría actualizada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: (id: string) => deleteCategory(id),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Categoría eliminada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return {
		create,
		isCreating,
		update,
		isUpdating,
		remove,
		isDeleting,
	};
};
