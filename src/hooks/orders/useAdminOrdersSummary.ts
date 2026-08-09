import { useQuery } from '@tanstack/react-query';
import { getAdminOrdersSummary } from '../../services/adminOrders.service';

// Distinto de useOrdersSummary (legacy, sobre Supabase).
export const useAdminOrdersSummary = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['admin-orders', 'summary'],
		queryFn: getAdminOrdersSummary,
	});

	return { summary: data, isLoading };
};
