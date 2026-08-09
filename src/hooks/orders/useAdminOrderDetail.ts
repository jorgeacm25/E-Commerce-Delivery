import { useQuery } from '@tanstack/react-query';
import { getAdminOrderById } from '../../services/adminOrders.service';

// Distinto de useOrderAdmin (legacy, sobre Supabase, alcance de cliente):
// esta pantalla es del panel admin real, contra el backend .NET
// (api/order + api/customer).
export const useAdminOrderDetail = (id?: string) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-orders', 'detail', id],
		queryFn: () => getAdminOrderById(id as string),
		enabled: Boolean(id),
		retry: false,
	});

	return { order: data, isLoading, isError };
};
