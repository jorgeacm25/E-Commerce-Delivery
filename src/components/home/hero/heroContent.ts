// Contenido estático del hero. Se separa de los componentes para poder
// cambiar textos, opciones del menú o diapositivas sin tocar el layout.

export interface HeroNavItem {
	label: string;
	href: string;
}

// Opciones provisionales: se reemplazarán por las secciones definitivas.
export const heroNavItems: HeroNavItem[] = [
	{ label: 'Opción 1', href: '/' },
	{ label: 'Opción 2', href: '/' },
	{ label: 'Opción 3', href: '/' },
	{ label: 'Opción 4', href: '/' },
	{ label: 'Opción 5', href: '/' },
];

interface HeroImageSlide {
	kind: 'image';
	id: string;
	src: string;
	alt: string;
	caption: string;
	/** `contain` muestra la imagen completa (sin recortar) sobre una copia
	 *  desenfocada de sí misma; útil cuando el logo queda en un borde. */
	fit?: 'cover' | 'contain';
}

interface HeroTextSlide {
	kind: 'text';
	id: string;
	eyebrow: string;
	title: string;
	description: string;
}

export type HeroSlide = HeroImageSlide | HeroTextSlide;

// Imágenes y textos se alternan para que el carrusel nunca muestre dos
// fotos seguidas.
export const heroSlides: HeroSlide[] = [
	{
		kind: 'image',
		id: 'shopping-from-phone',
		src: '/img/hero/shopping-from-phone.jpeg',
		alt: 'Mujer sonriente comprando combos de Delivery’s Home desde su celular',
		caption: 'Compra desde tu celular en minutos',
	},
	{
		kind: 'text',
		id: 'best-option',
		eyebrow: 'Delivery’s Home',
		title: 'Somos tu mejor opción',
		description: 'Calidad, puntualidad y cariño en cada entrega a tu familia en Cuba.',
	},
	{
		kind: 'image',
		id: 'combo-box',
		src: '/img/hero/combo-box.jpeg',
		alt: 'Caja de Delivery’s Home llena de alimentos y productos de aseo',
		caption: 'Combos de alimentos y aseo listos para enviar',
		fit: 'contain',
	},
	{
		kind: 'text',
		id: 'family-stocked',
		eyebrow: 'Combos familiares',
		title: 'Llena su despensa hoy',
		description: 'Arroz, carnes, lácteos y aseo en un solo pedido. Tú eliges, nosotros llevamos.',
	},
	{
		kind: 'image',
		id: 'combo-products',
		src: '/img/hero/combo-products.jpeg',
		alt: 'Surtido de productos Delivery’s Home: arroz, carnes, lácteos, dulces y aseo',
		caption: 'Productos seleccionados, cortes premium',
		fit: 'contain',
	},
	{
		kind: 'text',
		id: 'track-order',
		eyebrow: 'Entrega a domicilio',
		title: 'De tu pantalla a su mesa',
		description: 'Sigue tu pedido en todo momento hasta que llegue a manos del destinatario.',
	},
];
