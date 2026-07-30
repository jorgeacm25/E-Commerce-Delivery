import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { Input, Textarea } from '../../ui';

export const ReferencesStep = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>
				Ayuda al mensajero a encontrar la dirección y déjanos un teléfono alternativo por si no
				logramos contactar al destinatario.
			</p>

			<Textarea
				label='Punto de referencia cercano'
				required
				placeholder='Ej. Frente al parque, casa de dos plantas color azul'
				error={errors.references?.referencePoint?.message}
				{...register('references.referencePoint')}
			/>

			<Input
				label='Teléfono alternativo'
				type='tel'
				hint='Opcional. Un segundo número por si no logramos contactar al destinatario.'
				error={errors.references?.alternatePhone?.message}
				{...register('references.alternatePhone')}
			/>
		</div>
	);
};
