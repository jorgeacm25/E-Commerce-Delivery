import { formatPrice } from '../../helpers';
import { useCartStore } from '../../store/cart.store';

// Resumen lateral del pedido, visible en todos los pasos del checkout. A
// diferencia de CartSummary (/carrito) es de solo lectura: aquí no se edita
// el carrito, solo se confirma lo que ya se decidió antes de llegar al
// checkout.
export const CheckoutOrderSummary = () => {
	const items = useCartStore(state => state.items);
	const subtotal = useCartStore(state => state.subtotal);
	const discount = useCartStore(state => state.discount);
	const deliveryCost = useCartStore(state => state.deliveryCost);
	const total = useCartStore(state => state.total);
	const coupon = useCartStore(state => state.coupon);

	return (
		<div className='flex flex-col gap-4 rounded-2xl border border-neutral-200 p-5'>
			<h2 className='text-lg font-bold text-neutral-900'>Resumen del pedido</h2>

			<ul className='flex max-h-64 flex-col gap-3 overflow-y-auto'>
				{items.map(item => (
					<li key={`${item.variantId}-${item.comboId ?? 'suelto'}`} className='flex gap-3'>
						<img
							src={item.image}
							alt=''
							className='h-12 w-12 shrink-0 rounded-lg border border-neutral-200 object-contain'
						/>
						<div className='flex flex-1 flex-col text-sm'>
							<span className='font-medium text-neutral-900'>{item.name}</span>
							<span className='text-xs text-neutral-500'>
								{item.variantLabel} · x{item.quantity}
							</span>
						</div>
						<span className='text-sm font-medium text-neutral-900'>
							{formatPrice(item.price * item.quantity)}
						</span>
					</li>
				))}
			</ul>

			<dl className='flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm'>
				<div className='flex justify-between'>
					<dt className='text-neutral-600'>Subtotal</dt>
					<dd className='font-medium text-neutral-900'>{formatPrice(subtotal)}</dd>
				</div>

				{discount > 0 && (
					<div className='flex justify-between'>
						<dt className='text-neutral-600'>Descuento{coupon ? ` (${coupon.code})` : ''}</dt>
						<dd className='font-medium text-success-700'>-{formatPrice(discount)}</dd>
					</div>
				)}

				<div className='flex justify-between'>
					<dt className='text-neutral-600'>Envío</dt>
					<dd className='font-medium text-neutral-900'>
						{deliveryCost > 0 ? formatPrice(deliveryCost) : 'Gratis'}
					</dd>
				</div>

				<div className='flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900'>
					<dt>Total</dt>
					<dd>{formatPrice(total)}</dd>
				</div>
			</dl>
		</div>
	);
};
