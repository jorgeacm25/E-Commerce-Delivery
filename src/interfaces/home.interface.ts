// Tipos del contenido de la página de inicio. Estos datos aún no tienen una
// tabla propia en Supabase: se sirven desde src/services/home.service.ts
// (servicio simulado) hasta que el negocio defina el modelo real.

export interface HomeCategory {
	id: string;
	slug: string;
	label: string;
	imageUrl: string;
	productCount: number;
}

export interface HomeCombo {
	id: string;
	slug: string;
	name: string;
	description: string;
	imageUrl: string;
	priceUsd: number;
	itemsCount: number;
}

export interface HomeProduct {
	id: string;
	slug: string;
	name: string;
	imageUrl: string;
	priceUsd: number;
	inStock: boolean;
}

export interface HowItWorksStep {
	id: string;
	order: number;
	title: string;
	description: string;
}

export interface DeliveryZone {
	id: string;
	province: string;
	municipalities: string[];
	available: boolean;
	estimatedDeliveryDays: string;
}

export type HomeIconKey =
	| 'dollar'
	| 'truck'
	| 'shield'
	| 'chat'
	| 'refresh'
	| 'clock'
	| 'check';

export interface HomeBenefit {
	id: string;
	icon: HomeIconKey;
	title: string;
	description: string;
}

export interface HomeGuarantee {
	id: string;
	icon: HomeIconKey;
	title: string;
	description: string;
}

export interface HomeTestimonial {
	id: string;
	buyerName: string;
	buyerCountry: string;
	recipientCity: string;
	quote: string;
	rating: number;
}

export interface HomeFaq {
	id: string;
	question: string;
	answer: string;
}
