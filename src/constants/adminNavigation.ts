import {
	FiBarChart2,
	FiBookOpen,
	FiBox,
	FiDollarSign,
	FiGrid,
	FiMapPin,
	FiPackage,
	FiSettings,
	FiShoppingBag,
	FiTag,
	FiTruck,
	FiUserCheck,
	FiUsers,
} from 'react-icons/fi';
import { IconType } from 'react-icons';

// Fase del roadmap de negocio (docs/ROADMAP.md) a la que pertenece cada
// módulo. 'X' = Rendimiento, agregado fuera del roadmap original a pedido
// explícito del usuario (no tiene fase propia en ROADMAP.md).
export type AdminRoadmapPhase = 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'X';

export interface AdminNavItem {
	label: string;
	href: string;
	icon: IconType;
	phase: AdminRoadmapPhase;
	// Módulos con phase !== 'B' están construidos como catch-all
	// (AdminSectionPlaceholderPage), no como página propia todavía.
	isBuilt: boolean;
}

export const adminNavigation: AdminNavItem[] = [
	{ label: 'Dashboard', href: '/admin', icon: FiGrid, phase: 'B', isBuilt: true },
	{ label: 'Pedidos', href: '/admin/pedidos', icon: FiShoppingBag, phase: 'B', isBuilt: true },
	// Inventario = fusión de Productos (Fase B) y Almacén (Fase C): tabla de
	// productos con columnas de negocio + acciones por fila, y pestañas de
	// alertas e historial. /admin/productos y /admin/almacen redirigen aquí.
	{ label: 'Inventario', href: '/admin/inventario', icon: FiBox, phase: 'C', isBuilt: true },
	{ label: 'Categorías', href: '/admin/categorias', icon: FiTag, phase: 'B', isBuilt: true },
	{ label: 'Combos', href: '/admin/combos', icon: FiPackage, phase: 'B', isBuilt: true },
	{ label: 'Clientes', href: '/admin/clientes', icon: FiUsers, phase: 'D', isBuilt: true },
	{ label: 'Vendedores', href: '/admin/vendedores', icon: FiUserCheck, phase: 'E', isBuilt: true },
	{ label: 'Trabajadores', href: '/admin/trabajadores', icon: FiTruck, phase: 'F', isBuilt: true },
	{ label: 'Remesas', href: '/admin/remesas', icon: FiDollarSign, phase: 'G', isBuilt: true },
	{ label: 'Contabilidad', href: '/admin/contabilidad', icon: FiBookOpen, phase: 'H', isBuilt: true },
	{ label: 'Configuración', href: '/admin/configuracion', icon: FiSettings, phase: 'I', isBuilt: true },
	{ label: 'Rendimiento', href: '/admin/rendimiento', icon: FiBarChart2, phase: 'X', isBuilt: true },
	{ label: 'Zonas de entrega', href: '/admin/zonas-entrega', icon: FiMapPin, phase: 'X', isBuilt: true },
];
