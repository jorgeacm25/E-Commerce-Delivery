// Productos reales del panel admin, contra el backend .NET real
// (Almacen-Delivery-Home_Api_new, `api/product`). El backend modela un
// almacén genérico (nombre, cantidad, unidad, proveedor, vencimiento,
// precio, imágenes) — no tiene variantes/presentaciones múltiples, slug ni
// descripción, a diferencia del catálogo público simulado
// (`CatalogProduct`, sin relación con este tipo). El nombre y la unidad no
// se pueden editar una vez creado el producto (limitación real del backend,
// ver `ProductController`/`UpdateProductEntityCommand` — Update no acepta
// esos campos).
export interface AdminProduct {
	id: string;
	categoryId: string;
	categoryName: string;
	name: string;
	unit: string;
	priceUsd: number;
	discountPriceUsd: number | null;
	stock: number;
	provider: string;
	// Vencimiento más próximo entre los lotes registrados (el backend guarda
	// un historial de vencimientos por reabastecimiento, no un único campo).
	endDate: string;
	images: string[];
	createdByName: string;
	updatedAt: string;
}

export interface AdminProductInput {
	categoryId: string;
	name: string;
	unit: string;
	priceUsd: number;
	discountPriceUsd: number | null;
	stock: number;
	provider: string;
	endDate: string;
	images: (File | string)[];
}

export interface AdminProductSearchParams {
	query?: string;
	categoryId?: string;
	page?: number;
	pageSize?: number;
}

export interface AdminProductSearchResult {
	items: AdminProduct[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
