// Categorías reales del catálogo admin, contra el backend .NET
// (Almacen-Delivery-Home_Api_new, `api/category`). Distinto de
// `CatalogCategory` (src/interfaces/catalog.interface.ts), que es
// zod-inferred y sirve al catálogo público simulado. El backend solo maneja
// nombre y slug (sin descripción, imagen, orden ni activo/inactivo).
export interface AdminCategory {
	id: string;
	slug: string;
	name: string;
}

export interface AdminCategoryInput {
	slug: string;
	name: string;
}
