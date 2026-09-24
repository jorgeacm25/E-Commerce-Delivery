// Stats del dashboard admin (`/admin`). Solo quedan las reales aquí: las
// de las fases C-I (stock, entregas, comisiones, nómina, gastos) se
// calculan en AdminOverviewPage desde los hooks reales de cada módulo — el
// antiguo AdminDashboardMockStats se eliminó al cerrar la Fase C
// (Almacén), cuando ya ningún placeholder usaba sus campos. La actividad
// reciente (AdminActivityItem) sigue simulada: le falta un endpoint de
// auditoría en el backend (ver src/services/adminDashboard.service.ts).
export interface AdminDashboardRealStats {
	ordersToday: number;
	salesUsdThisMonth: number;
	avgTicketUsd: number;
	activeExchangeRate: number | null;
}

export type AdminActivityType =
	| 'order'
	| 'payment'
	| 'product'
	| 'combo'
	| 'category';

export interface AdminActivityItem {
	id: string;
	type: AdminActivityType;
	description: string;
	occurredAt: string;
}

export type AdminDateRangePreset = 'today' | 'week' | 'month';
