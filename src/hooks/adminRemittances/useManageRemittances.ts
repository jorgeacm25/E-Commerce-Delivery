import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRemittance, updateRemittanceStatus } from '../../services/adminRemittances.service';
import { AdminRemittanceInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageRemittances = () => {
	const queryClient = useQueryClient();
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-remittances'] });

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminRemittanceInput) => createRemittance(input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Remesa registrada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
		mutationFn: updateRemittanceStatus,
		onSuccess: () => {
			invalidate();
			showSuccessToast('Estado de la remesa actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, updateStatus, isUpdatingStatus };
};
