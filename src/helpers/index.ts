import { Color, Product, Profile, VariantProduct } from '../interfaces';

export * from './cn';

// Toda mutación contra el backend .NET real que registra "quién lo hizo"
// (productos, salidas de almacén, gastos...) necesita saber si el staff
// logueado es Admin o User — el backend rechaza mandar ambos a la vez. Ver
// Profile.accountType en auth.interface.ts.
export const actorIdsFromProfile = (
	profile: Profile | null
): { adminId: string | null; userId: string | null } => ({
	adminId: profile?.accountType === 'admin' ? profile.id : null,
	userId: profile?.accountType === 'user' ? profile.id : null,
});

// Cualquier campo `DateTime` del backend .NET real exige UTC (Npgsql
// rechaza `Kind=Unspecified` contra `timestamp with time zone` y esto
// tumba el proceso, no solo la request). Un input HTML `type="date"` da
// "yyyy-MM-dd" sin zona horaria — hay que convertirlo antes de mandarlo.
// `new Date("yyyy-MM-dd")` ya se interpreta como medianoche UTC (spec de
// Date de JS), así que `.toISOString()` alcanza.
export const toUtcDateTime = (dateOnly: string): string => new Date(dateOnly).toISOString();

// Función para formatear el precio a dólares
export const formatPrice = (price: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price);
};

// Función para formatear un monto ya convertido a CUP (sin símbolo de moneda nativo,
// porque Intl no tiene formato oficial para CUP)
export const formatCup = (amount: number) => {
	const formatted = new Intl.NumberFormat('es-CU', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);

	return `${formatted} CUP`;
};

// Convierte un monto en USD a CUP dada la tasa de cambio vigente
export const convertUsdToCup = (usd: number, valorCupPorUsd: number) => {
	return usd * valorCupPorUsd;
};

// Función para preparar los productos - (CELULARES)
export const prepareProducts = (products: Product[]) => {
	return products.map(product => {
		// Agrupar las variantes por color
		const colors = product.variants.reduce(
			(acc: Color[], variant: VariantProduct) => {
				const existingColor = acc.find(
					item => item.color === variant.color
				);

				if (existingColor) {
					// Si ya existe el color, comparamos los precios
					existingColor.price = Math.min(
						existingColor.price,
						variant.price
					);
				} // Mantenemos el precio mínimo
				else {
					acc.push({
						color: variant.color,
						price: variant.price,
						name: variant.color_name,
					});
				}

				return acc;
			},
			[]
		);

		// Obtener el precio más bajo de las variantes agrupadas
		const price = Math.min(...colors.map(item => item.price));

		// Devolver el producto formateado
		return {
			...product,
			price,
			colors: colors.map(({ name, color }) => ({ name, color })),
			variants: product.variants,
		};
	});
};

// Función para formatear la fecha a formato 3 de enero de 2022
export const formatDateLong = (date: string): string => {
	const dateObject = new Date(date);

	return dateObject.toLocaleDateString('es-ES', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

// Función para formatear la fecha a formato dd/mm/yyyy
export const formatDate = (date: string): string => {
	const dateObject = new Date(date);
	return dateObject.toLocaleDateString('es-ES', {
		year: 'numeric',
		month: '2-digit',
		day: 'numeric',
	});
};

// Función para obtener el estado del pedido en español
export const getStatus = (status: string): string => {
	switch (status) {
		case 'Pending':
			return 'Pendiente';
		case 'Paid':
			return 'Pagado';
		case 'Shipped':
			return 'Enviado';
		case 'Delivered':
			return 'Entregado';
		case 'Cancelled':
			return 'Cancelado';
		default:
			return status;
	}
};

// Función para generar el slug de un producto
export const generateSlug = (name: string): string => {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
};

// Función para extraer el path relativo al bucket de una URL
export const extractFilePath = (url: string) => {
	const parts = url.split(
		'/storage/v1/object/public/product-images/'
	);
	// EJEMPLO PARTS: ['/storage/v1/ object/public/product-images/', '02930920302302030293023-iphone-12-pro-max.jpg']

	if (parts.length !== 2) {
		throw new Error(`URL de imagen no válida: ${url}`);
	}

	return parts[1];
};
