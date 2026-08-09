import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminAccount } from '../../services/adminAccounts.service';
import { AdminAccountInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageAdminAccounts = () => {
	const queryClient = useQueryClient();

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminAccountInput) => createAdminAccount(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
			showSuccessToast('Cuenta creada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating };
};
