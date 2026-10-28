import { FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../../store/cart.store';
import { useGlobalStore } from '../../store/global.store';

// Abre el carrito en panel lateral (ver components/cart/CartDrawer)
export const CartLink = () => {
	const totalItemsInCart = useCartStore(state => state.totalItemsInCart);
	const openSheet = useGlobalStore(state => state.openSheet);

	return (
		<button
			type='button'
			onClick={() => openSheet('cart')}
			// Destino del vuelo "add to basket" (helpers/flyToCart)
			data-cart-target
			aria-haspopup='dialog'
			aria-label={`Carrito de compras, ${totalItemsInCart} artículos`}
			className='focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15'
		>
			<FiShoppingBag className='text-xl' aria-hidden='true' />
			{totalItemsInCart > 0 && (
				// `key` reinicia el nodo en cada cambio de cantidad para
				// reproducir el rebote (pop) del contador.
				<span
					key={totalItemsInCart}
					className='absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-neutral-950 animate-pop'
				>
					{totalItemsInCart}
				</span>
			)}
		</button>
	);
};
