import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPaymentAccount, updatePaymentAccount } from '../../services/paymentAccounts.service';
import { AdminPaymentAccountInput, AdminPaymentAccountUpdateInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManagePaymentAccounts = () => {
	const queryClient = useQueryClient();
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-payment-accounts'] });

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminPaymentAccountInput) => createPaymentAccount(input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Cuenta de cobro creada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: AdminPaymentAccountUpdateInput }) =>
			updatePaymentAccount(id, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Cuenta de cobro actualizada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: setActive, isPending: isSettingActive } = useMutation({
		mutationFn: ({ id, activa }: { id: string; activa: boolean }) => updatePaymentAccount(id, { activa }),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Estado actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, update, isUpdating, setActive, isSettingActive };
};
