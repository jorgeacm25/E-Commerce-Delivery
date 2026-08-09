import { AdminActivityItem, AdminDashboardMockStats } from '../interfaces';

// Placeholders de las Fases C-I del roadmap (docs/ROADMAP.md), que todavía
// no tienen tabla/lógica real: almacén (stock bajo/vencimientos, Fase C),
// entregas (Fase F), comisiones (Fase E), nómina (Fase F), gastos (Fase H).
// Ver src/services/adminDashboard.service.ts.
export const adminDashboardMockStats: AdminDashboardMockStats = {
	lowStockCount: 6,
	expiringProductsCount: 3,
	pendingDeliveriesCount: 8,
	pendingCommissionsUsd: 142.5,
	pendingPayrollUsd: 320,
	expensesUsd: 890.25,
};

export const adminRecentActivityMock: AdminActivityItem[] = [
	{
		id: 'activity-1',
		type: 'order',
		description: 'Nuevo pedido #DH-000482 recibido',
		occurredAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
	},
	{
		id: 'activity-2',
		type: 'payment',
		description: 'Comprobante de pago verificado para el pedido #DH-000480',
		occurredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
	},
	{
		id: 'activity-3',
		type: 'product',
		description: 'Producto "Arroz 5 lb" marcado con stock bajo',
		occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
	},
	{
		id: 'activity-4',
		type: 'combo',
		description: 'Combo "Dulce merienda" actualizado',
		occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
	},
	{
		id: 'activity-5',
		type: 'category',
		description: 'Categoría "Congelados" creada',
		occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
	},
];
