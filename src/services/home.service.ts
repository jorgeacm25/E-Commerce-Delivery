import { apiFetch } from '../api/client';
import { ProductResultDto } from '../api/types';
import {
	DeliveryZone,
	HomeBenefit,
	HomeCombo,
	HomeCategory,
	HomeFaq,
	HomeGuarantee,
	HomeProduct,
	HomeTestimonial,
	HowItWorksStep,
} from '../interfaces';
import {
	deliveryZonesMock,
	familyCombosMock,
	featuredCategoriesMock,
	homeBenefitsMock,
	homeFaqsMock,
	homeGuaranteesMock,
	testimonialsMock,
	howItWorksStepsMock,
} from '../data/home.mock';

// Servicio simulado para el contenido de la página de inicio: todavía no
// existe una tabla para estos datos (categorías destacadas, combos
// familiares, testimonios, etc.), así que se sirven en memoria con una
// latencia simulada para que el consumo con TanStack Query sea realista
// (loading -> success/error). Reemplazar por llamadas reales cuando el
// modelo de datos correspondiente exista. Excepción: getPopularProductsHome
// ya sale del backend real (api/product, ver catalog.service.ts), no de
// data/home.mock.ts, para que las fotos que se suben en el panel admin se
// vean también acá.
const simulateNetworkDelay = <T>(data: T, delayMs = 350): Promise<T> =>
	new Promise(resolve => {
		setTimeout(() => resolve(data), delayMs);
	});

const PLACEHOLDER_IMAGE = 'https://ui.shadcn.com/placeholder.svg';
const POPULAR_PRODUCTS_LIMIT = 6;

export const getFeaturedCategories = (): Promise<HomeCategory[]> =>
	simulateNetworkDelay(featuredCategoriesMock);

export const getFamilyCombos = (): Promise<HomeCombo[]> =>
	simulateNetworkDelay(familyCombosMock);

export const getPopularProductsHome = async (): Promise<HomeProduct[]> => {
	const products = await apiFetch<ProductResultDto[]>('/api/product', { auth: false });

	// Sin métrica de popularidad en el backend todavía: se muestran los
	// primeros N tal cual vienen, no un ranking inventado.
	return products.slice(0, POPULAR_PRODUCTS_LIMIT).map(
		(product): HomeProduct => ({
			id: product.id,
			slug: product.id,
			name: product.name,
			imageUrl: product.images[0] ?? PLACEHOLDER_IMAGE,
			priceUsd: product.salePriceUsd,
			inStock: product.quantity > 0,
		})
	);
};

export const getHowItWorksSteps = (): Promise<HowItWorksStep[]> =>
	simulateNetworkDelay(howItWorksStepsMock);

export const getDeliveryZones = (): Promise<DeliveryZone[]> =>
	simulateNetworkDelay(deliveryZonesMock);

export const getHomeBenefits = (): Promise<HomeBenefit[]> =>
	simulateNetworkDelay(homeBenefitsMock);

export const getHomeGuarantees = (): Promise<HomeGuarantee[]> =>
	simulateNetworkDelay(homeGuaranteesMock);

export const getTestimonials = (): Promise<HomeTestimonial[]> =>
	simulateNetworkDelay(testimonialsMock);

export const getHomeFaqs = (): Promise<HomeFaq[]> => simulateNetworkDelay(homeFaqsMock);
