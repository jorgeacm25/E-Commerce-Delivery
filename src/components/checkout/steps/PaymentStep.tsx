import { Controller, useFormContext } from 'react-hook-form';
import { FiShieldOff } from 'react-icons/fi';
import { PAYMENT_METHOD_OPTIONS } from '../../../constants/checkout';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { Alert, RadioGroup } from '../../ui';

// No se integra ningún procesador de pago real todavía (ver CLAUDE.md) ni
// se captura número de tarjeta en ningún método: el pedido se crea real en
// el backend al confirmar, pero el pago se verifica a mano (subiendo un
// comprobante después, ver OrderConfirmedPage) — incluso el método
// "tarjeta" resuelve así.
export const PaymentStep = () => {
	const {
		control,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>Elige cómo prefieres pagar tu pedido.</p>

			<Controller
				control={control}
				name='payment.method'
				render={({ field }) => (
					<RadioGroup
						label='Método de pago'
						value={field.value}
						onChange={field.onChange}
						error={errors.payment?.method?.message}
						options={PAYMENT_METHOD_OPTIONS.map(option => ({
							value: option.value,
							label: option.label,
							description: option.description,
						}))}
					/>
				)}
			/>

			<Alert variant='info'>
				<span className='inline-flex items-center gap-1.5'>
					<FiShieldOff aria-hidden='true' />
					Nunca te pedimos el número de tu tarjeta. Si el método elegido requiere
					comprobante, podrás subirlo después de confirmar el pedido.
				</span>
			</Alert>
		</div>
	);
};
