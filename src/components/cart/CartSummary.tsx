import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../helpers';
import { useCartStore } from '../../store/cart.store';
import { Button, ConfirmDialog } from '../ui';
import { CouponForm } from './CouponForm';

// Resumen de totales de /carrito. Los montos mostrados son una estimación
// provisional calculada en el cliente a partir del precio de cada línea; el
// total definitivo se confirma en el servidor al procesar el checkout (ver
// la nota sobre precios en src/store/cart.store.ts).
export const CartSummary = () => {
	const subtotal = useCartStore(state => state.subtotal);
	const discount = useCartStore(state => state.discount);
	const deliveryCost = useCartStore(state => state.deliveryCost);
	const total = useCartStore(state => state.total);
	const cleanCart = useCartStore(state => state.cleanCart);

	const [isConfirmingClear, setIsConfirmingClear] = useState(false);

	return (
		<div className='flex flex-col gap-5 rounded-2xl border border-neutral-200 p-5'>
			<h2 className='text-lg font-bold text-neutral-900'>Resumen del pedido</h2>

			<CouponForm />

			<dl className='flex flex-col gap-2 text-sm'>
				<div className='flex justify-between'>
					<dt className='text-neutral-600'>Subtotal</dt>
					<dd className='font-medium text-neutral-900'>{formatPrice(subtotal)}</dd>
				</div>

				{discount > 0 && (
					<div className='flex justify-between'>
						<dt className='text-neutral-600'>Descuento</dt>
						<dd className='font-medium text-success-700'>-{formatPrice(discount)}</dd>
					</div>
				)}

				<div className='flex justify-between'>
					<dt className='text-neutral-600'>Envío</dt>
					<dd className='font-medium text-neutral-900'>
						{deliveryCost > 0 ? formatPrice(deliveryCost) : 'Se calcula en el checkout'}
					</dd>
				</div>

				<div className='flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900'>
					<dt>Total estimado</dt>
					<dd>{formatPrice(total)}</dd>
				</div>
			</dl>

			<p className='text-xs text-neutral-500'>
				Este total es provisional y se confirma al finalizar la compra.
			</p>

			<Link to='/checkout'>
				<Button fullWidth>Ir al checkout</Button>
			</Link>

			<Button variant='ghost' fullWidth onClick={() => setIsConfirmingClear(true)}>
				Vaciar carrito
			</Button>

			<ConfirmDialog
				isOpen={isConfirmingClear}
				onClose={() => setIsConfirmingClear(false)}
				onConfirm={() => {
					cleanCart();
					setIsConfirmingClear(false);
				}}
				title='¿Vaciar el carrito?'
				description='Se eliminarán todos los productos y el cupón aplicado. Esta acción no se puede deshacer.'
				confirmLabel='Vaciar carrito'
				variant='danger'
			/>
		</div>
	);
};
