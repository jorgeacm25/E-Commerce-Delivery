export interface ComboItemInput {
	variantId: string;
	cantidad: number;
}

export interface ComboInput {
	nombre: string;
	slug: string;
	descripcion?: string;
	precioComboUsd: number;
	items: ComboItemInput[];
}

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
	variant_id: string;
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
}

export interface ComboWithItems extends Combo {
	combo_items: ComboItemWithVariant[];
}
