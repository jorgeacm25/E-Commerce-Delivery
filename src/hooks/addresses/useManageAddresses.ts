import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerAddressInput } from '../../interfaces';
import { createAddress, deleteAddress, updateAddress } from '../../services/address.service';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageAddresses = (profileId?: string) => {
	const queryClient = useQueryClient();
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses', profileId] });

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: CustomerAddressInput) => createAddress(profileId as string, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Dirección guardada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: CustomerAddressInput }) => updateAddress(id, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Dirección actualizada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: (id: string) => deleteAddress(id),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Dirección eliminada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, update, isUpdating, remove, isDeleting };
};
