import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { CartLineItem, CartSummary } from '../../components/cart';
import { Button, EmptyState, PageHeader, Skeleton } from '../../components/ui';
import { AddItemResult, useCartStore } from '../../store/cart.store';

const stockErrorMessage = (result: Extract<AddItemResult, { ok: false }>) =>
	result.reason === 'OUT_OF_STOCK'
		? 'Ese producto ya no tiene unidades disponibles.'
		: `Solo quedan ${result.availableStock} unidad(es) disponibles.`;

export const CartPage = () => {
	const items = useCartStore(state => state.items);
	const totalItemsInCart = useCartStore(state => state.totalItemsInCart);
	const hasHydrated = useCartStore(state => state.hasHydrated);

	if (!hasHydrated) {
		return (
			<div className='container flex flex-col gap-8 py-8'>
				<Skeleton variant='text' className='h-8 w-64' />
				<div className='grid gap-8 lg:grid-cols-3'>
					<div className='flex flex-col gap-4 lg:col-span-2'>
						<Skeleton className='h-28 rounded-xl' />
						<Skeleton className='h-28 rounded-xl' />
					</div>
					<Skeleton className='h-64 rounded-2xl' />
				</div>
			</div>
		);
	}

	return (
		<div className='container flex flex-col gap-8 py-8'>
			<PageHeader
				title='Carrito de compras'
				description={
					totalItemsInCart > 0
						? `Tienes ${totalItemsInCart} artículo(s) en el carrito.`
						: 'Tu carrito está vacío.'
				}
				breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Carrito' }]}
			/>

			{items.length === 0 ? (
				<EmptyState
					icon={<FiShoppingBag />}
					title='Todavía no agregas productos'
					description='Explora el catálogo para encontrar alimentos y combos para enviar a Cuba.'
					action={
						<Link to='/catalogo'>
							<Button>Ir al catálogo</Button>
						</Link>
					}
				/>
			) : (
				<div className='grid gap-8 lg:grid-cols-3'>
					<ul className='flex flex-col gap-4 lg:col-span-2'>
						{items.map(item => (
							<CartLineItem
								key={`${item.variantId}-${item.comboId ?? 'suelto'}`}
								item={item}
								onStockError={result => toast.error(stockErrorMessage(result))}
							/>
						))}
					</ul>

					<CartSummary />
				</div>
			)}
		</div>
	);
};
