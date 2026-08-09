import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpense } from '../../services/adminAccounting.service';
import { ExpenseInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useCreateExpense = () => {
	const queryClient = useQueryClient();

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: ExpenseInput) => createExpense(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-accounting'] });
			showSuccessToast('Gasto registrado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating };
};
