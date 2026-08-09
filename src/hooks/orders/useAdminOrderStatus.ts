import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminOrderStatus } from '../../services/adminOrders.service';
import { showErrorToast, showSuccessToast } from '../../components/ui';

// Distinto de useChangeStatusOrder (legacy, sobre Supabase, todavía usado
// por src/components/dashboard/orders/TableOrdersAdmin.tsx sin enrutar).
export const useAdminOrderStatus = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: updateAdminOrderStatus,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
			showSuccessToast('Estado del pedido actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { mutate, isPending };
};
