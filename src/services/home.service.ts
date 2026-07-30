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
	popularProductsMock,
	testimonialsMock,
	howItWorksStepsMock,
} from '../data/home.mock';

// Servicio simulado para el contenido de la página de inicio: todavía no
// existe una tabla en Supabase para estos datos (categorías destacadas,
// combos familiares, testimonios, etc.), así que se sirven en memoria con
// una latencia simulada para que el consumo con TanStack Query sea realista
// (loading -> success/error). Reemplazar por llamadas reales en `actions/`
// cuando el modelo de datos correspondiente exista.
const simulateNetworkDelay = <T>(data: T, delayMs = 350): Promise<T> =>
	new Promise(resolve => {
		setTimeout(() => resolve(data), delayMs);
	});

export const getFeaturedCategories = (): Promise<HomeCategory[]> =>
	simulateNetworkDelay(featuredCategoriesMock);

export const getFamilyCombos = (): Promise<HomeCombo[]> =>
	simulateNetworkDelay(familyCombosMock);

export const getPopularProductsHome = (): Promise<HomeProduct[]> =>
	simulateNetworkDelay(popularProductsMock);

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
