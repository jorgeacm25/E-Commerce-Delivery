import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSeller, settleSellerCommissions, updateSeller } from '../../services/adminSellers.service';
import { AdminSellerInput, AdminSellerUpdateInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageSellers = () => {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
	};

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminSellerInput) => createSeller(input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Vendedor creado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: AdminSellerUpdateInput }) => updateSeller(id, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Vendedor actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: settle, isPending: isSettling } = useMutation({
		mutationFn: (sellerId: string) => settleSellerCommissions(sellerId),
		onSuccess: result => {
			invalidate();
			showSuccessToast(
				result.settledCount > 0
					? `${result.settledCount} comisión(es) liquidada(s)`
					: 'No había comisiones pendientes'
			);
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, update, isUpdating, settle, isSettling };
};
