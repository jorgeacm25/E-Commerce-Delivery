import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createAdminAccount,
	deleteAdminAccount,
	resetAdminAccountPassword,
} from '../../services/adminAccounts.service';
import { AdminAccountInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageAdminAccounts = () => {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
	};

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminAccountInput) => createAdminAccount(input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Cuenta creada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: resetPassword, isPending: isResettingPassword } = useMutation({
		mutationFn: ({
			id,
			accountType,
			password,
		}: {
			id: string;
			accountType: 'admin' | 'user';
			password: string;
		}) => resetAdminAccountPassword(id, accountType, password),
		onSuccess: () => showSuccessToast('Contraseña actualizada'),
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: ({ id, accountType }: { id: string; accountType: 'admin' | 'user' }) =>
			deleteAdminAccount(id, accountType),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Cuenta eliminada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, resetPassword, isResettingPassword, remove, isDeleting };
};
