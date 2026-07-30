import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { Input } from '../../ui';

// Datos de la persona que recibe el pedido en Cuba, separados del comprador
// (ver BuyerStep). El teléfono aquí es el de contacto en Cuba.
export const RecipientStep = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>Datos de quién recibirá el pedido en Cuba.</p>

			<Input
				label='Nombre completo del destinatario'
				required
				error={errors.recipient?.fullName?.message}
				{...register('recipient.fullName')}
			/>

			<Input
				label='Teléfono del destinatario'
				type='tel'
				required
				placeholder='Ej. +53 5 123 4567'
				error={errors.recipient?.phone?.message}
				{...register('recipient.phone')}
			/>

			<Input
				label='Relación con el destinatario'
				hint='Opcional. Ej. familiar, amigo/a.'
				error={errors.recipient?.relationship?.message}
				{...register('recipient.relationship')}
			/>
		</div>
	);
};
