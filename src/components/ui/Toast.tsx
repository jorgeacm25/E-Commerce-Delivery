import toast from 'react-hot-toast';
import { AlertVariant } from './Alert';
import { flyToCart } from '../../helpers/flyToCart';
import { AddedToCartToast } from './AddedToCartToast';
import { ToastCard } from './ToastCard';

const showToast = (variant: AlertVariant, message: string) =>
	toast.custom(t => <ToastCard t={t} variant={variant} message={message} />);

export const showSuccessToast = (message: string) => showToast('success', message);
export const showErrorToast = (message: string) => showToast('danger', message);
export const showInfoToast = (message: string) => showToast('info', message);
export const showWarningToast = (message: string) => showToast('warning', message);

export const showAddedToCartToast = (item: { name: string; image?: string; quantity?: number }) =>
	toast.custom(
		t => <AddedToCartToast t={t} name={item.name} image={item.image} quantity={item.quantity ?? 1} />,
		{ position: 'bottom-right', duration: 3000 }
	);

// Vuelo del producto al carrito y, al aterrizar, la notificación. No
// bloquea: el artículo ya está en el carrito antes de que empiece la animación.
export const celebrateAddToCart = (
	item: { name: string; image?: string; quantity?: number },
	source: HTMLElement | null
) => {
	void flyToCart(source).then(() => showAddedToCartToast(item));
};
