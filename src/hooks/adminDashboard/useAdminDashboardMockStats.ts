import { useQuery } from '@tanstack/react-query';
import {
	getAdminDashboardMockStats,
	getAdminRecentActivity,
} from '../../services/adminDashboard.service';

export const useAdminDashboardMockStats = () => {
	const statsQuery = useQuery({
		queryKey: ['admin-dashboard', 'mock', 'stats'],
		queryFn: getAdminDashboardMockStats,
	});

	const activityQuery = useQuery({
		queryKey: ['admin-dashboard', 'mock', 'activity'],
		queryFn: getAdminRecentActivity,
	});

	return {
		stats: statsQuery.data,
		isLoadingStats: statsQuery.isLoading,
		activity: activityQuery.data ?? [],
		isLoadingActivity: activityQuery.isLoading,
	};
};
