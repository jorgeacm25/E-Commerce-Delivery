import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '../../store/cart.store';

export const CartLink = () => {
	const totalItemsInCart = useCartStore(state => state.totalItemsInCart);

	return (
		<Link
			to='/carrito'
			aria-label={`Carrito de compras, ${totalItemsInCart} artículos`}
			className='focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100'
		>
			<FiShoppingBag className='text-xl' aria-hidden='true' />
			{totalItemsInCart > 0 && (
				<span className='absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white'>
					{totalItemsInCart}
				</span>
			)}
		</Link>
	);
};
