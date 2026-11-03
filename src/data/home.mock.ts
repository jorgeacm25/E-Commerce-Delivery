import { placeholderCategories } from '../constants/navigation';
import {
	DeliveryZone,
	HomeBenefit,
	HomeCombo,
	HomeCategory,
	HomeFaq,
	HomeFeaturedProduct,
	HomeGuarantee,
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

// Fotos de referencia de Unsplash (licencia gratuita) para cada categoría,
// hasta que existan imágenes propias. Se piden recortadas al tamaño de la
// tarjeta para no descargar el original.
const unsplashPhoto = (photoId: string) =>
	`https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=640&h=480&q=70`;

const categoryImages: Record<string, string> = {
	'combos-familiares': unsplashPhoto('1608686207856-001b95cf60ca'),
	despensa: unsplashPhoto('1645567454567-901dc409551b'),
	'carnes-y-embutidos': unsplashPhoto('1692311358804-34b31f6ef43c'),
	bebidas: unsplashPhoto('1524802020103-aa46eaffcaa2'),
	aseo: unsplashPhoto('1649073005971-37babef31983'),
	congelados: unsplashPhoto('1601599967100-f16100982063'),
	dulces: unsplashPhoto('1765174639852-73f77b49e3c6'),
};

export const featuredCategoriesMock: HomeCategory[] = placeholderCategories.map(
	category => ({
		id: category.slug,
		slug: category.slug,
		label: category.label,
		imageUrl: categoryImages[category.slug] ?? PLACEHOLDER_IMAGE,
		productCount: categoryProductCounts[category.slug] ?? 0,
	})
);

export const familyCombosMock: HomeCombo[] = [
	{
		id: 'combo-familiar-basico',
		slug: 'combo-familiar-basico',
		name: 'Combo Familiar Básico',
		description: 'Arroz, aceite, pollo y granos para una familia de 4 durante dos semanas.',
		imageUrl: unsplashPhoto('1543168256-418811576931'),
		priceUsd: 45,
		itemsCount: 8,
	},
	{
		id: 'combo-mensual-completo',
		slug: 'combo-mensual-completo',
		name: 'Combo Mensual Completo',
		description: 'La despensa completa del mes: granos, proteínas, aseo y bebidas.',
		imageUrl: unsplashPhoto('1685640206182-c51b8aa9b686'),
		priceUsd: 89,
		itemsCount: 16,
	},
	{
		id: 'combo-cuidado-bebe',
		slug: 'combo-cuidado-bebe',
		name: 'Combo Cuidado del Bebé',
		description: 'Pañales, leche en polvo y productos de higiene para el bebé.',
		imageUrl: unsplashPhoto('1695998575483-b215c8b2f619'),
		priceUsd: 38,
		itemsCount: 6,
	},
	{
		id: 'combo-aseo-hogar',
		slug: 'combo-aseo-hogar',
		name: 'Combo Aseo del Hogar',
		description: 'Detergente, jabón, desinfectante y papel higiénico.',
		imageUrl: unsplashPhoto('1626379481874-3dc5678fa8ca'),
		priceUsd: 32,
		itemsCount: 7,
	},
];

// Productos destacados de prueba (datos simulados): una muestra de cada
// categoría con foto de Unsplash. Más adelante esta lista saldrá de las
// compras y pedidos reales; hoy no existe esa métrica.
type FeaturedCategorySlug = 'carnes-y-embutidos' | 'bebidas' | 'despensa' | 'aseo';

const featuredCategoryLabels: Record<FeaturedCategorySlug, string> = {
	'carnes-y-embutidos': 'Cárnicos',
	bebidas: 'Bebidas',
	despensa: 'Despensa',
	aseo: 'Aseo',
};

const featuredProduct = (
	slug: string,
	name: string,
	categorySlug: FeaturedCategorySlug,
	photoId: string,
	priceUsd: number,
	inStock = true
): HomeFeaturedProduct => ({
	id: slug,
	slug,
	name,
	imageUrl: unsplashPhoto(photoId),
	priceUsd,
	inStock,
	categorySlug,
	categoryLabel: featuredCategoryLabels[categorySlug],
});

export const featuredProductsMock: HomeFeaturedProduct[] = [
	// Cárnicos: 3 picadillos, 2 carnes y pollo
	featuredProduct('picadillo-res-1lb', 'Picadillo de res 1lb', 'carnes-y-embutidos', '1764620931673-ba46205f2e4e', 4.5),
	featuredProduct('picadillo-condimentado-1lb', 'Picadillo condimentado 1lb', 'carnes-y-embutidos', '1609183556292-f208be1a9644', 3.95),
	featuredProduct('picadillo-hamburguesa-2lb', 'Picadillo para hamburguesas 2lb', 'carnes-y-embutidos', '1612078894671-f11ba41d713e', 7.8),
	featuredProduct('bistec-res-2lb', 'Bistec de res 2lb', 'carnes-y-embutidos', '1603048297172-c92544798d5a', 14.9),
	featuredProduct('bistec-cerdo-2lb', 'Bistec de cerdo 2lb', 'carnes-y-embutidos', '1628268909376-e8c44bb3153f', 9.5),
	featuredProduct('pechuga-pollo-2lb', 'Pechuga de pollo 2lb', 'carnes-y-embutidos', '1682991136736-a2b44623eeba', 7.25, false),
	// Bebidas
	featuredProduct('refrescos-lata-6u', 'Refrescos de lata surtidos (6 u)', 'bebidas', '1527960471264-932f39eb5846', 6.6),
	featuredProduct('jugo-mango-1l', 'Jugo de mango 1L', 'bebidas', '1546173159-315724a31696', 3.2),
	// Despensa
	featuredProduct('arroz-blanco-5lb', 'Arroz blanco 5lb', 'despensa', '1586201375761-83865001e31c', 5.9),
	featuredProduct('frijoles-negros-2lb', 'Frijoles negros 2lb', 'despensa', '1709229851054-a09c8f7bd7e3', 4.1),
	featuredProduct('aceite-girasol-1l', 'Aceite de girasol 1L', 'despensa', '1720468750623-39e9a09f5067', 6.5),
	// Aseo
	featuredProduct('detergente-liquido-3l', 'Detergente líquido 3L', 'aseo', '1624372635310-01d078c05dd9', 8.4),
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
