import { useFormContext } from 'react-hook-form';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { Input } from '../../ui';

export const AddressStep = () => {
	const {
		register,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>
				Dirección donde se entregará el pedido en Cuba. La provincia y el municipio se
				seleccionan en el siguiente paso.
			</p>

			<Input
				label='Calle y número'
				required
				placeholder='Ej. Calle 23 #456, entre 10 y 12'
				error={errors.address?.addressLine1?.message}
				{...register('address.addressLine1')}
			/>

			<Input
				label='Apartamento, edificio o piso'
				hint='Opcional.'
				error={errors.address?.addressLine2?.message}
				{...register('address.addressLine2')}
			/>
		</div>
	);
};
