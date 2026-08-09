import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AdminDateRangePreset } from '../interfaces';

interface AdminUiState {
	// Solo esto se persiste (ver partialize abajo) — es preferencia de UI del
	// usuario, no estado de sesión.
	sidebarCollapsed: boolean;
	toggleSidebar: () => void;

	mobileNavOpen: boolean;
	openMobileNav: () => void;
	closeMobileNav: () => void;

	// Solo afecta las stats reales del Dashboard (pedidos hoy/ventas del
	// mes), no un filtro global de Pedidos/Productos.
	dashboardDateRange: AdminDateRangePreset;
	setDashboardDateRange: (range: AdminDateRangePreset) => void;
}

export const useAdminUiStore = create<AdminUiState>()(
	persist(
		set => ({
			sidebarCollapsed: false,
			toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

			mobileNavOpen: false,
			openMobileNav: () => set({ mobileNavOpen: true }),
			closeMobileNav: () => set({ mobileNavOpen: false }),

			dashboardDateRange: 'today',
			setDashboardDateRange: range => set({ dashboardDateRange: range }),
		}),
		{
			name: 'admin-ui',
			storage: createJSONStorage(() => localStorage),
			partialize: state => ({ sidebarCollapsed: state.sidebarCollapsed }),
		}
	)
);
