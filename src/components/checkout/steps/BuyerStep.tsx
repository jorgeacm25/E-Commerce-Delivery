import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { Input } from '../../ui';

// Datos del comprador: puede estar fuera de Cuba y ser una persona distinta
// del destinatario (ver RecipientStep). El país se pide como texto libre
// porque el comprador puede escribir desde cualquier lugar del mundo.
export const BuyerStep = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>
				Estos son tus datos como comprador. El destinatario en Cuba puede ser otra persona.
			</p>

			<Input
				label='Nombre completo'
				required
				autoComplete='name'
				error={errors.buyer?.fullName?.message}
				{...register('buyer.fullName')}
			/>

			<Input
				label='Correo electrónico'
				type='email'
				required
				autoComplete='email'
				error={errors.buyer?.email?.message}
				{...register('buyer.email')}
			/>

			<Input
				label='Teléfono'
				type='tel'
				required
				autoComplete='tel'
				hint='Te contactaremos aquí si hay algún problema con tu pedido.'
				error={errors.buyer?.phone?.message}
				{...register('buyer.phone')}
			/>

			<Input
				label='País desde donde compras'
				required
				autoComplete='country-name'
				placeholder='Ej. Estados Unidos'
				error={errors.buyer?.country?.message}
				{...register('buyer.country')}
			/>
		</div>
	);
};
