// Combos reales del panel admin, contra el backend .NET (api/combo). El
// backend arma un combo con precio propio + productos reales del almacén
// (id + cantidad, ver api/product) — sin slug, descripción ni estado
// activo/inactivo, a diferencia del combo simulado anterior sobre Supabase
// (catalog_products/combo_items). Tampoco hay imagen propia por combo; el
// catálogo público la resuelve del primer producto incluido que tenga foto
// (ver src/services/catalog.service.ts).
export interface AdminComboProduct {
	id: string;
	name: string;
	quantity: number;
	unit: string;
}

export interface AdminCombo {
	id: string;
	name: string;
	priceUsd: number;
	discountPriceUsd: number | null;
	products: AdminComboProduct[];
	createdByName: string;
}

export interface AdminComboProductInput {
	id: string;
	quantity: number;
}

export interface AdminComboInput {
	name: string;
	priceUsd: number;
	discountPriceUsd: number | null;
	products: AdminComboProductInput[];
}
