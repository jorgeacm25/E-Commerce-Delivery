import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpense, deleteExpense, updateExpense } from '../../services/adminAccounting.service';
import { ExpenseInput, ExpenseUpdateInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageExpenses = () => {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['admin-accounting'] });
	};

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: ExpenseInput) => createExpense(input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Gasto registrado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: ExpenseUpdateInput }) => updateExpense(id, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Gasto actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: (id: string) => deleteExpense(id),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Gasto eliminado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, update, isUpdating, remove, isDeleting };
};
