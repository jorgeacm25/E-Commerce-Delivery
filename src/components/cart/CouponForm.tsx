import { FormEvent, useState } from 'react';
import { FiTag, FiX } from 'react-icons/fi';
import { useCartStore } from '../../store/cart.store';
import { Badge, Button, Input } from '../ui';

const errorMessages: Record<string, string> = {
	NOT_FOUND: 'Ese código de cupón no existe.',
	EXPIRED: 'Ese cupón ya venció.',
	MIN_SUBTOTAL_NOT_MET: 'El subtotal del carrito no alcanza el mínimo requerido para este cupón.',
};

export const CouponForm = () => {
	const coupon = useCartStore(state => state.coupon);
	const applyCoupon = useCartStore(state => state.applyCoupon);
	const removeCoupon = useCartStore(state => state.removeCoupon);

	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();

		if (!code.trim()) return;

		const result = applyCoupon(code);

		if (!result.ok) {
			setError(
				result.reason === 'MIN_SUBTOTAL_NOT_MET' && result.minSubtotal
					? `Este cupón requiere un subtotal mínimo de $${result.minSubtotal.toFixed(2)}.`
					: errorMessages[result.reason]
			);
			return;
		}

		setError(null);
		setCode('');
	};

	if (coupon) {
		return (
			<div className='flex items-center justify-between gap-3 rounded-xl border border-success-500/30 bg-success-50 p-3'>
				<div className='flex items-center gap-2'>
					<FiTag className='text-success-600' aria-hidden='true' />
					<div>
						<p className='text-sm font-semibold text-success-700'>{coupon.code}</p>
						<p className='text-xs text-success-700'>{coupon.description}</p>
					</div>
				</div>

				<Button
					type='button'
					variant='ghost'
					size='sm'
					leftIcon={<FiX />}
					onClick={() => removeCoupon()}
				>
					Quitar
				</Button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-2'>
			<div className='flex gap-2'>
				<Input
					label='Cupón de descuento'
					placeholder='Ej. BIENVENIDA10'
					value={code}
					onChange={event => setCode(event.target.value)}
					containerClassName='flex-1'
					error={error ?? undefined}
				/>
				<Button type='submit' variant='outline' className='self-end'>
					Aplicar
				</Button>
			</div>
			{!error && (
				<Badge variant='neutral' className='w-fit'>
					Prueba con BIENVENIDA10
				</Badge>
			)}
		</form>
	);
};
