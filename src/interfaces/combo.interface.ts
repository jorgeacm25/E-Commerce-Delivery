export interface Combo {
	id: string;
	nombre: string;
	slug: string;
	descripcion: string | null;
	precio_combo_usd: number;
	activo: boolean;
	created_at: string;
}

export interface ComboItemWithVariant {
	id: string;
	cantidad: number;
	// Exactamente uno de los dos está presente por fila (constraint
	// combo_items_variant_ref_check).
	variant_id: string | null;
	variants: {
		id: string;
		color_name: string;
		storage: string;
		price: number;
		products: {
			name: string;
			images: string[];
		} | null;
	} | null;
	catalog_variant_id: string | null;
	catalog_product_variants: {
		id: string;
		label: string;
		price_usd: number;
		catalog_products: {
			name: string;
			images: string[];
		} | null;
	} | null;
}

export interface ComboWithItems extends Combo {
	combo_items: ComboItemWithVariant[];
}
