import { AdminActivityItem } from '../interfaces';

// Actividad reciente simulada — el único bloque del dashboard que sigue en
// mock: no hay endpoint de auditoría en el backend para alimentarlo
// (pendiente fuera de las fases C-I, ver docs/ROADMAP.md). Las stats que
// antes estaban aquí (stock bajo/vencimientos, entregas, comisiones,
// nómina, gastos) ya se calculan reales en AdminOverviewPage desde los
// hooks de cada módulo. Ver src/services/adminDashboard.service.ts.
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
