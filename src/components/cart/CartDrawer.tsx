import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { formatPrice } from '../../helpers';
import { AddItemResult, useCartStore } from '../../store/cart.store';
import { useGlobalStore } from '../../store/global.store';
import { Button, Drawer, EmptyState, Skeleton } from '../ui';
import { CartLineItem } from './CartLineItem';
import { CouponForm } from './CouponForm';

const stockErrorMessage = (result: Extract<AddItemResult, { ok: false }>) =>
	result.reason === 'OUT_OF_STOCK'
		? 'Ese producto ya no tiene unidades disponibles.'
		: `Solo quedan ${result.availableStock} unidad(es) disponibles.`;

// Carrito en panel lateral (sustituye a la antigua página /carrito). Se abre
// con `openSheet('cart')` del store global desde la navbar o desde cualquier
// otra pantalla. Los montos son una estimación provisional calculada en el
// cliente; el total definitivo se confirma en el servidor al procesar el
// checkout (ver la nota sobre precios en src/store/cart.store.ts).
export const CartDrawer = () => {
	const isOpen = useGlobalStore(state => state.isSheetOpen && state.sheetContent === 'cart');
	const closeSheet = useGlobalStore(state => state.closeSheet);

	const items = useCartStore(state => state.items);
	const totalItemsInCart = useCartStore(state => state.totalItemsInCart);
	const hasHydrated = useCartStore(state => state.hasHydrated);
	const subtotal = useCartStore(state => state.subtotal);
	const discount = useCartStore(state => state.discount);
	const deliveryCost = useCartStore(state => state.deliveryCost);
	const total = useCartStore(state => state.total);
	const cleanCart = useCartStore(state => state.cleanCart);

	const navigate = useNavigate();
	const [isConfirmingClear, setIsConfirmingClear] = useState(false);

	// La confirmación de "vaciar" no sobrevive a un cierre del panel. Se
	// descarta al abrir (no al cerrar) para que no cambie durante la salida.
	const [wasOpen, setWasOpen] = useState(isOpen);
	if (wasOpen !== isOpen) {
		setWasOpen(isOpen);
		if (isOpen) setIsConfirmingClear(false);
	}

	const goToCheckout = () => {
		closeSheet();
		navigate('/checkout');
	};

	const hasItems = hasHydrated && items.length > 0;

	return (
		<Drawer
			isOpen={isOpen}
			onClose={closeSheet}
			title={totalItemsInCart > 0 ? `Tu carrito (${totalItemsInCart})` : 'Tu carrito'}
			size='md'
			tone='brand'
			footer={
				hasItems && (
					<div className='flex flex-col gap-4'>
						<dl className='flex flex-col gap-1.5 text-sm'>
							<div className='flex justify-between'>
								<dt className='text-secondary-100'>Subtotal</dt>
								<dd className='font-medium text-white'>{formatPrice(subtotal)}</dd>
							</div>

							{discount > 0 && (
								<div className='flex justify-between'>
									<dt className='text-secondary-100'>Descuento</dt>
									<dd className='font-medium text-secondary-200'>-{formatPrice(discount)}</dd>
								</div>
							)}

							<div className='flex justify-between'>
								<dt className='text-secondary-100'>Envío</dt>
								<dd className='font-medium text-white'>
									{deliveryCost > 0 ? formatPrice(deliveryCost) : 'Se calcula en el checkout'}
								</dd>
							</div>

							<div className='flex justify-between border-t border-white/15 pt-2 text-base font-bold text-white'>
								<dt>Total estimado</dt>
								<dd className='text-primary-300'>{formatPrice(total)}</dd>
							</div>
						</dl>

						<Button fullWidth onClick={goToCheckout}>
							Ir al checkout
						</Button>

						<p className='text-center text-xs text-secondary-100'>
							Este total es provisional y se confirma al finalizar la compra.
						</p>
					</div>
				)
			}
		>
			{!hasHydrated ? (
				<div className='flex flex-col gap-4'>
					<Skeleton className='h-28 rounded-xl opacity-30' />
					<Skeleton className='h-28 rounded-xl opacity-30' />
				</div>
			) : items.length === 0 ? (
				<EmptyState
					icon={<FiShoppingBag />}
					title='Todavía no agregas productos'
					description='Explora el catálogo para encontrar alimentos y combos para enviar a Cuba.'
					className='bg-white/95'
					action={
						<Link to='/catalogo' onClick={closeSheet}>
							<Button>Ir al catálogo</Button>
						</Link>
					}
				/>
			) : (
				<div className='flex flex-col gap-5'>
					<ul className='flex flex-col gap-3'>
						{items.map(item => (
							<CartLineItem
								key={`${item.variantId}-${item.comboId ?? 'suelto'}`}
								item={item}
								onStockError={result => toast.error(stockErrorMessage(result))}
							/>
						))}
					</ul>

					<div className='flex justify-end'>
						{isConfirmingClear ? (
							<div role='group' aria-label='Confirmar vaciado' className='flex items-center gap-2 text-xs'>
								<span className='text-white'>¿Vaciar el carrito?</span>
								<Button
									size='sm'
									variant='danger'
									onClick={() => {
										cleanCart();
										setIsConfirmingClear(false);
									}}
								>
									Sí, vaciar
								</Button>
								<button
									type='button'
									onClick={() => setIsConfirmingClear(false)}
									className='focus-ring rounded-lg px-3 py-1.5 font-semibold text-white transition-colors hover:bg-white/15'
								>
									Cancelar
								</button>
							</div>
						) : (
							<button
								type='button'
								onClick={() => setIsConfirmingClear(true)}
								className='focus-ring inline-flex items-center gap-1.5 rounded text-xs font-semibold text-white/90 transition-colors hover:text-white'
							>
								<FiTrash2 aria-hidden='true' /> Vaciar carrito
							</button>
						)}
					</div>

					<div className='rounded-xl bg-white/95 p-4 text-neutral-900'>
						<CouponForm />
					</div>
				</div>
			)}
		</Drawer>
	);
};
