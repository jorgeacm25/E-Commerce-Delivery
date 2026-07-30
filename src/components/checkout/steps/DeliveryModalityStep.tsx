import { Controller, useFormContext } from 'react-hook-form';
import { DELIVERY_MODALITY_OPTIONS } from '../../../constants/checkout';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { RadioGroup } from '../../ui';

export const DeliveryModalityStep = () => {
	const {
		control,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>Elige cómo quieres que reciba el pedido el destinatario.</p>

			<Controller
				control={control}
				name='delivery.modality'
				render={({ field }) => (
					<RadioGroup
						label='Modalidad de entrega'
						value={field.value}
						onChange={field.onChange}
						error={errors.delivery?.modality?.message}
						options={DELIVERY_MODALITY_OPTIONS.map(option => ({
							value: option.value,
							label: `${option.label} — ${option.cost > 0 ? `$${option.cost.toFixed(2)}` : 'Gratis'}`,
							description: option.description,
						}))}
					/>
				)}
			/>
		</div>
	);
};
