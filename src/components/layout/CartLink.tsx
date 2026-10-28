import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../../store/cart.store';

export const CartLink = () => {
	const totalItemsInCart = useCartStore(state => state.totalItemsInCart);

	return (
		<Link
			to='/carrito'
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
		</Link>
	);
};
