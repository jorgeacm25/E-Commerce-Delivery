import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCustomer, updateCustomer } from '../../services/adminCustomers.service';
import { AdminCustomerUpdateInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageCustomers = () => {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
	};

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: AdminCustomerUpdateInput }) => updateCustomer(id, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Cliente actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: (id: string) => deleteCustomer(id),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Cliente eliminado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { update, isUpdating, remove, isDeleting };
};
