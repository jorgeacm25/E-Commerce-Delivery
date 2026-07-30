import { Controller, useFormContext } from 'react-hook-form';
import { FiShieldOff } from 'react-icons/fi';
import { PAYMENT_METHOD_OPTIONS } from '../../../constants/checkout';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { Alert, RadioGroup } from '../../ui';

// Pago simulado: no se integra ningún procesador de pago real todavía (ver
// CLAUDE.md) ni se captura número de tarjeta en ningún método, incluso el
// de "tarjeta" resuelve con verificación manual, igual que el resto del
// flujo de pagos manual ya existente en el proyecto.
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
					Este checkout es una simulación: no se procesan pagos reales ni se solicita el
					número de tu tarjeta.
				</span>
			</Alert>
		</div>
	);
};
