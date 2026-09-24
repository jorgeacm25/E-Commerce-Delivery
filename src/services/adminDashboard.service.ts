import { AdminActivityItem } from '../interfaces';
import { adminRecentActivityMock } from '../data/adminDashboard.mock';

// Actividad reciente simulada del dashboard: no hay endpoint de auditoría
// en el backend todavía (mismo patrón que src/services/home.service.ts —
// datos en memoria + latencia simulada). Las stats de las fases C-I ya son
// reales: AdminOverviewPage las calcula con los hooks de cada módulo
// (useStockAlerts, useAdminOrders, useAdminSellers, useAdminWorkers,
// useLedgerEntries), así que este servicio solo queda con la actividad —
// el antiguo getAdminDashboardMockStats se eliminó al cerrar la Fase C
// (Almacén) y comprobar que ya ningún placeholder usaba sus campos.
const simulateNetworkDelay = <T>(data: T, delayMs = 350): Promise<T> =>
	new Promise(resolve => {
		setTimeout(() => resolve(data), delayMs);
	});

export const getAdminRecentActivity = (): Promise<AdminActivityItem[]> =>
	simulateNetworkDelay(adminRecentActivityMock);
