// Stats del dashboard admin (`/admin`). Se dividen explícitamente en reales
// (ya hay tabla/datos) vs. simuladas (pertenecen a fases del roadmap C-I
// que todavía no se construyen, ver src/services/adminDashboard.service.ts).
export interface AdminDashboardRealStats {
	ordersToday: number;
	salesUsdThisMonth: number;
	avgTicketUsd: number;
	activeExchangeRate: number | null;
}

export interface AdminDashboardMockStats {
	lowStockCount: number;
	expiringProductsCount: number;
	pendingDeliveriesCount: number;
	pendingCommissionsUsd: number;
	pendingPayrollUsd: number;
	expensesUsd: number;
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
