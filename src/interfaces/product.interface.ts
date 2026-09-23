import { JSONContent } from '@tiptap/react';

// Tipo `Json` de Supabase (antes vivía en el generado src/supabase/supabase.ts,
// eliminado junto con el cliente Supabase — ver .env: el backend .NET es la
// única fuente de datos).
export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export interface Color {
	name: string;
	color: string;
	price: number;
}

export interface VariantProduct {
	id: string;
	stock: number;
	price: number;
	storage: string;
	color: string;
	color_name: string;
}

export interface Product {
	id: string;
	name: string;
	brand: string;
	slug: string;
	features: string[];
	description: Json;
	images: string[];
	created_at: string;
	variants: VariantProduct[];
}

export interface PreparedProducts {
	id: string;
	name: string;
	brand: string;
	slug: string;
	features: string[];
	description: Json;
	images: string[];
	created_at: string;
	price: number;
	colors: {
		name: string;
		color: string;
	}[];
	variants: VariantProduct[];
}

export interface ProductInput {
	name: string;
	brand: string;
	slug: string;
	features: string[];
	description: JSONContent;
	images: (File | string)[];
	variants: VariantInput[];
}

export interface VariantInput {
	id?: string;
	stock: number;
	price: number;
	color: string;
	storage: string;
	colorName: string;
}
