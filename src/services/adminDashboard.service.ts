import { AdminActivityItem, AdminDashboardMockStats } from '../interfaces';
import { adminDashboardMockStats, adminRecentActivityMock } from '../data/adminDashboard.mock';

// Servicio simulado: stats de módulos que todavía no existen (Almacén Fase
// C, Vendedores Fase E, Trabajadores/Entregas Fase F, Gastos Fase H, ver
// docs/ROADMAP.md). Mismo patrón que src/services/home.service.ts (datos en
// memoria + latencia simulada) — reemplazar cada getter por una llamada real
// cuando la fase correspondiente se construya, sin tocar las demás.
const simulateNetworkDelay = <T>(data: T, delayMs = 350): Promise<T> =>
	new Promise(resolve => {
		setTimeout(() => resolve(data), delayMs);
	});

export const getAdminDashboardMockStats = (): Promise<AdminDashboardMockStats> =>
	simulateNetworkDelay(adminDashboardMockStats);

export const getAdminRecentActivity = (): Promise<AdminActivityItem[]> =>
	simulateNetworkDelay(adminRecentActivityMock);
