import { useActiveExchangeRate } from '../payments/useActiveExchangeRate';
import { useAdminOrdersSummary } from '../orders/useAdminOrdersSummary';
import { AdminDashboardRealStats } from '../../interfaces';

// Stats reales del Dashboard admin: pedidos/ventas (backend .NET real,
// api/order) + tasa de cambio vigente (tabla `exchange_rates`, ya real).
// Distinto de useAdminRecentActivity, que sirve la actividad reciente
// simulada (mock, le falta un endpoint de auditoría).
export const useAdminDashboardStats = () => {
	const { summary, isLoading: isLoadingSummary } = useAdminOrdersSummary();
	const { data: exchangeRate, isLoading: isLoadingRate } = useActiveExchangeRate();

	const stats: AdminDashboardRealStats = {
		ordersToday: summary?.ordersToday ?? 0,
		salesUsdThisMonth: summary?.salesUsdThisMonth ?? 0,
		avgTicketUsd: summary?.avgTicketUsd ?? 0,
		activeExchangeRate: exchangeRate?.valor_cup_por_usd ?? null,
	};

	return { stats, isLoading: isLoadingSummary || isLoadingRate };
};
