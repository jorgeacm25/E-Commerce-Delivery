import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMunicipalityDeliveryFee } from '../../services/adminDeliveryZones.service';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageDeliveryZones = () => {
	const queryClient = useQueryClient();

	const { mutate: updateFee, isPending: isUpdatingFee } = useMutation({
		mutationFn: ({ id, deliveryFeeUsd }: { id: string; deliveryFeeUsd: number }) =>
			updateMunicipalityDeliveryFee(id, deliveryFeeUsd),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-municipalities'] });
			showSuccessToast('Tarifa actualizada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { updateFee, isUpdatingFee };
};
