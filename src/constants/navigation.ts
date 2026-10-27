export interface NavLinkItem {
	label: string;
	href: string;
}

// Navegación principal del sitio público (dominio alimentos/combos)
export const mainNavLinks: NavLinkItem[] = [
	{ label: 'Catálogo', href: '/catalogo' },
	{ label: 'Combos', href: '/combos' },
	{ label: 'Contacto', href: '/contacto' },
	{ label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
];

export interface CategoryLinkItem {
	label: string;
	slug: string;
}

// Categorías provisionales, en espera del modelo de datos definitivo de categorías
export const placeholderCategories: CategoryLinkItem[] = [
	{ label: 'Combos familiares', slug: 'combos-familiares' },
	{ label: 'Despensa', slug: 'despensa' },
	{ label: 'Carnes y embutidos', slug: 'carnes-y-embutidos' },
	{ label: 'Bebidas', slug: 'bebidas' },
	{ label: 'Aseo personal y del hogar', slug: 'aseo' },
	{ label: 'Congelados', slug: 'congelados' },
	{ label: 'Dulces', slug: 'dulces' },
];

export const footerLinks: NavLinkItem[] = [
	{ label: 'Rastrear pedido', href: '/rastrear-pedido' },
	{ label: 'Política de privacidad', href: '/politicas/privacidad' },
	{ label: 'Términos y condiciones', href: '/politicas/terminos' },
	{ label: 'Política de entrega', href: '/politicas/entrega' },
	{ label: 'Política de reembolsos', href: '/politicas/reembolsos' },
];

// Accesos rápidos del footer
export const footerQuickLinks: NavLinkItem[] = [{ label: 'Dashboard', href: '/admin' }];
