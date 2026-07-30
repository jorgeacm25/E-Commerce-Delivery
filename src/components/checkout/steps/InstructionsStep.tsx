import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { Textarea } from '../../ui';

export const InstructionsStep = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>
				¿Algo más que debamos saber sobre este pedido? Por ejemplo, horarios de entrega
				preferidos o cuidados especiales con el contenido.
			</p>

			<Textarea
				label='Instrucciones especiales'
				hint='Opcional.'
				rows={5}
				error={errors.instructions?.specialInstructions?.message}
				{...register('instructions.specialInstructions')}
			/>
		</div>
	);
};
