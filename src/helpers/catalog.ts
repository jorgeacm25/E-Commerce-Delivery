import { ICartItem } from '../components/shared/CartItem';
import { BadgeVariant } from '../components/ui/Badge';
import { CatalogProduct, CatalogProductVariant, ProductAvailability } from '../interfaces';

export const availabilityLabel = (
	availability: ProductAvailability
): { label: string; badgeVariant: BadgeVariant } => {
	switch (availability) {
		case 'out_of_stock':
			return { label: 'Agotado', badgeVariant: 'danger' };
		case 'low_stock':
			return { label: 'Pocas unidades', badgeVariant: 'warning' };
		default:
			return { label: 'Disponible', badgeVariant: 'success' };
	}
};

// Arma la línea de carrito para un producto del catálogo simulado, ya sea
// producto simple, con variante seleccionada, o combo (un combo se agrega
// como una sola línea con su precio propio, no se expande en sub-items).
export const buildCartItem = (
	product: CatalogProduct,
	quantity = 1,
	variant?: CatalogProductVariant
): ICartItem => ({
	variantId: variant?.id ?? product.id,
	productId: product.id,
	name: product.name,
	variantLabel: variant?.label ?? product.weightOrUnitLabel,
	price: variant?.priceUsd ?? product.priceUsd,
	quantity,
	image: product.images[0],
	...(product.isCombo ? { comboId: product.id, comboName: product.name } : {}),
});
