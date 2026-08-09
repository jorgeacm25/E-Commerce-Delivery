import { useQuery } from '@tanstack/react-query';
import { AdminOrderSearchParams } from '../../interfaces';
import { getAdminOrders } from '../../services/adminOrders.service';

// Distinto de useAllOrders (legacy, sobre Supabase, todavía usado por
// src/pages/dashboard/DashboardOrdersPage.tsx sin enrutar) — este hook es
// del panel admin real, contra el backend .NET.
export const useAdminOrders = (params: AdminOrderSearchParams = {}) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-orders', params],
		queryFn: () => getAdminOrders(params),
		retry: 1,
	});

	return {
		orders: data?.items ?? [],
		total: data?.total ?? 0,
		totalPages: data?.totalPages ?? 1,
		isLoading,
		isError,
	};
};
