import { placeholderCategories } from '../constants/navigation';
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

// Imagen de relleno reutilizada del resto del proyecto (ver src/data/initialData.ts)
// hasta que existan fotos reales de producto/combo.
const PLACEHOLDER_IMAGE = 'https://ui.shadcn.com/placeholder.svg';

const categoryProductCounts: Record<string, number> = {
	'combos-familiares': 18,
	despensa: 42,
	'carnes-y-embutidos': 27,
	bebidas: 15,
	aseo: 22,
	congelados: 12,
	dulces: 19,
};

export const featuredCategoriesMock: HomeCategory[] = placeholderCategories.map(
	category => ({
		id: category.slug,
		slug: category.slug,
		label: category.label,
		imageUrl: PLACEHOLDER_IMAGE,
		productCount: categoryProductCounts[category.slug] ?? 0,
	})
);

export const familyCombosMock: HomeCombo[] = [
	{
		id: 'combo-familiar-basico',
		slug: 'combo-familiar-basico',
		name: 'Combo Familiar Básico',
		description: 'Arroz, aceite, pollo y granos para una familia de 4 durante dos semanas.',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 45,
		itemsCount: 8,
	},
	{
		id: 'combo-mensual-completo',
		slug: 'combo-mensual-completo',
		name: 'Combo Mensual Completo',
		description: 'La despensa completa del mes: granos, proteínas, aseo y bebidas.',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 89,
		itemsCount: 16,
	},
	{
		id: 'combo-cuidado-bebe',
		slug: 'combo-cuidado-bebe',
		name: 'Combo Cuidado del Bebé',
		description: 'Pañales, leche en polvo y productos de higiene para el bebé.',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 38,
		itemsCount: 6,
	},
	{
		id: 'combo-aseo-hogar',
		slug: 'combo-aseo-hogar',
		name: 'Combo Aseo del Hogar',
		description: 'Detergente, jabón, desinfectante y papel higiénico.',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 32,
		itemsCount: 7,
	},
];

export const popularProductsMock: HomeProduct[] = [
	{
		id: 'aceite-cocina-1l',
		slug: 'aceite-cocina-1l',
		name: 'Aceite de cocina 1L',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 6.5,
		inStock: true,
	},
	{
		id: 'arroz-5lb',
		slug: 'arroz-5lb',
		name: 'Arroz 5lb',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 5.9,
		inStock: true,
	},
	{
		id: 'pollo-entero-3lb',
		slug: 'pollo-entero-3lb',
		name: 'Pollo entero 3lb',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 8.75,
		inStock: true,
	},
	{
		id: 'detergente-polvo-1kg',
		slug: 'detergente-polvo-1kg',
		name: 'Detergente en polvo 1kg',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 4.2,
		inStock: false,
	},
	{
		id: 'leche-polvo-400g',
		slug: 'leche-polvo-400g',
		name: 'Leche en polvo 400g',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 7.3,
		inStock: true,
	},
	{
		id: 'cafe-molido-500g',
		slug: 'cafe-molido-500g',
		name: 'Café molido 500g',
		imageUrl: PLACEHOLDER_IMAGE,
		priceUsd: 6.1,
		inStock: true,
	},
];

export const howItWorksStepsMock: HowItWorksStep[] = [
	{
		id: 'paso-compra',
		order: 1,
		title: 'Compra desde donde estés',
		description:
			'Eliges productos o combos y pagas en línea desde cualquier país, sin que el destinatario tenga que hacer nada.',
	},
	{
		id: 'paso-destinatario',
		order: 2,
		title: 'Indica quién recibe el pedido en Cuba',
		description:
			'Registras los datos de la persona que recibirá la entrega: puede ser un familiar o cualquier destinatario distinto de ti.',
	},
	{
		id: 'paso-verificacion',
		order: 3,
		title: 'Verificamos y preparamos tu pedido',
		description:
			'Confirmamos el comprobante de pago y alistamos el pedido según el stock disponible y la zona de entrega.',
	},
	{
		id: 'paso-entrega',
		order: 4,
		title: 'Entregamos en Cuba y puedes rastrearlo',
		description:
			'Nuestro equipo entrega directamente al destinatario. Sigue el estado del pedido con tu número de seguimiento.',
	},
];

export const deliveryZonesMock: DeliveryZone[] = [
	{
		id: 'la-habana',
		province: 'La Habana',
		municipalities: ['Playa', 'Plaza', 'Centro Habana', 'Marianao'],
		available: true,
		estimatedDeliveryDays: '2-4 días',
	},
	{
		id: 'matanzas',
		province: 'Matanzas',
		municipalities: ['Matanzas', 'Cárdenas', 'Varadero'],
		available: true,
		estimatedDeliveryDays: '3-5 días',
	},
	{
		id: 'villa-clara',
		province: 'Villa Clara',
		municipalities: ['Santa Clara', 'Sagua la Grande'],
		available: true,
		estimatedDeliveryDays: '3-5 días',
	},
	{
		id: 'camaguey',
		province: 'Camagüey',
		municipalities: ['Camagüey', 'Florida'],
		available: true,
		estimatedDeliveryDays: '4-6 días',
	},
	{
		id: 'santiago-de-cuba',
		province: 'Santiago de Cuba',
		municipalities: ['Santiago de Cuba', 'Palma Soriano'],
		available: true,
		estimatedDeliveryDays: '5-7 días',
	},
	{
		id: 'guantanamo',
		province: 'Guantánamo',
		municipalities: ['Guantánamo', 'Baracoa'],
		available: false,
		estimatedDeliveryDays: 'Próximamente',
	},
];

export const homeBenefitsMock: HomeBenefit[] = [
	{
		id: 'precios-usd',
		icon: 'dollar',
		title: 'Precios claros en USD',
		description: 'Ves el precio en dólares desde el primer momento, sin sorpresas al pagar.',
	},
	{
		id: 'entrega-directa',
		icon: 'truck',
		title: 'Entrega directa al destinatario',
		description: 'Llevamos el pedido hasta la puerta de quien lo recibe en Cuba.',
	},
	{
		id: 'pago-seguro',
		icon: 'shield',
		title: 'Pago verificado manualmente',
		description: 'Cada comprobante se revisa antes de confirmar y preparar el pedido.',
	},
	{
		id: 'soporte-espanol',
		icon: 'chat',
		title: 'Soporte en español todos los días',
		description: 'Te acompañamos por WhatsApp durante todo el proceso de compra y entrega.',
	},
];

export const homeGuaranteesMock: HomeGuarantee[] = [
	{
		id: 'garantia-reembolso',
		icon: 'refresh',
		title: 'Reembolso si el pedido no llega',
		description: 'Si algo falla en la entrega, te devolvemos tu dinero o reenviamos el pedido.',
	},
	{
		id: 'garantia-verificacion',
		icon: 'check',
		title: 'Verificación antes de despachar',
		description: 'No se prepara ningún pedido sin confirmar primero el pago del comprador.',
	},
	{
		id: 'garantia-tiempo',
		icon: 'clock',
		title: 'Tiempos de entrega estimados',
		description: 'Conoces el tiempo aproximado de entrega según la zona antes de comprar.',
	},
];

export const testimonialsMock: HomeTestimonial[] = [
	{
		id: 'testimonio-maria',
		buyerName: 'María',
		buyerCountry: 'España',
		recipientCity: 'Holguín',
		quote:
			'Compré el combo mensual desde Madrid y mi mamá en Holguín lo recibió completo y en buen estado.',
		rating: 5,
	},
	{
		id: 'testimonio-carlos',
		buyerName: 'Carlos',
		buyerCountry: 'Estados Unidos',
		recipientCity: 'La Habana',
		quote:
			'Pude rastrear el pedido en todo momento y me avisaron apenas lo entregaron a mi tío en La Habana.',
		rating: 5,
	},
	{
		id: 'testimonio-ana',
		buyerName: 'Ana',
		buyerCountry: 'Italia',
		recipientCity: 'Santiago de Cuba',
		quote:
			'La atención por WhatsApp fue clave: me ayudaron a elegir el combo según lo que necesitaba mi familia.',
		rating: 4,
	},
];

export const homeFaqsMock: HomeFaq[] = [
	{
		id: 'faq-comprador-fuera',
		question: '¿Puedo comprar si no estoy en Cuba?',
		answer:
			'Sí. La compra la haces tú desde cualquier país; el destinatario en Cuba solo recibe el pedido.',
	},
	{
		id: 'faq-destinatario-paga',
		question: '¿El destinatario tiene que pagar algo al recibirlo?',
		answer: 'No. El pago lo realiza el comprador al momento de hacer el pedido.',
	},
	{
		id: 'faq-rastreo',
		question: '¿Cómo sé que mi pedido fue entregado?',
		answer:
			'Con tu número de pedido puedes rastrear el estado en la sección "Rastrear pedido" en cualquier momento.',
	},
	{
		id: 'faq-disponibilidad',
		question: '¿Qué pasa si un producto no está disponible en la zona del destinatario?',
		answer:
			'La disponibilidad depende del stock y de la zona de entrega; te lo indicamos antes de confirmar el pago.',
	},
	{
		id: 'faq-pago',
		question: '¿Cómo se confirma el pago?',
		answer:
			'Subes el comprobante de tu pago y nuestro equipo lo verifica manualmente antes de preparar el pedido.',
	},
];
