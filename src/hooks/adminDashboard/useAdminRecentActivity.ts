import { useQuery } from '@tanstack/react-query';
import { getAdminRecentActivity } from '../../services/adminDashboard.service';

// Actividad reciente del dashboard admin — sigue simulada (mock): el
// backend no expone un endpoint de auditoría que la alimente. Todo lo
// demás del dashboard ya es real (useAdminDashboardStats + los hooks de
// cada módulo que combina AdminOverviewPage). Antes este hook también
// servía las stats placeholder de las fases C-I; se renombró
// (useAdminDashboardMockStats) cuando esas stats pasaron a ser reales.
export const useAdminRecentActivity = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['admin-dashboard', 'mock', 'activity'],
		queryFn: getAdminRecentActivity,
	});

	return { activity: data ?? [], isLoading };
};
