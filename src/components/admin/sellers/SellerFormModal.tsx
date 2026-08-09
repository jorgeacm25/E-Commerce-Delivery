import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../../ui';
import { SellerFormValues, sellerFormSchema } from '../../../lib/adminSellerValidators';

const emptyValues: SellerFormValues = { fullName: '', phone: '', commissionPercentage: 10 };

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: SellerFormValues) => void;
	isSubmitting: boolean;
}

export const SellerFormModal = ({ isOpen, onClose, onSubmit, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SellerFormValues>({ resolver: zodResolver(sellerFormSchema), defaultValues: emptyValues });

	const handleClose = () => {
		reset(emptyValues);
		onClose();
	};

	const submit = (data: SellerFormValues) => {
		onSubmit(data);
		reset(emptyValues);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Nuevo vendedor'
			footer={
				<>
					<Button variant='outline' onClick={handleClose}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit(submit)} isLoading={isSubmitting}>
						Guardar
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit(submit)} className='flex flex-col gap-4'>
				<Input label='Nombre completo' required error={errors.fullName?.message} {...register('fullName')} />
				<Input label='Teléfono' required error={errors.phone?.message} {...register('phone')} />
				<Input
					label='Comisión (%)'
					type='number'
					min={0}
					max={100}
					step='0.1'
					required
					hint='Porcentaje del total del pedido que se acredita al entregarlo'
					error={errors.commissionPercentage?.message}
					{...register('commissionPercentage')}
				/>
			</form>
		</Modal>
	);
};
