import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../../ui';
import { CustomerEditFormValues, customerEditFormSchema } from '../../../lib/adminCustomerValidators';
import { AdminCustomer } from '../../../interfaces';

interface Props {
	isOpen: boolean;
	customer: AdminCustomer | null;
	onClose: () => void;
	onSubmit: (values: CustomerEditFormValues) => void;
	isSubmitting: boolean;
}

export const CustomerEditModal = ({ isOpen, customer, onClose, onSubmit, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CustomerEditFormValues>({ resolver: zodResolver(customerEditFormSchema) });

	useEffect(() => {
		if (customer) {
			reset({ fullName: customer.fullName, phone: customer.phone, password: '' });
		}
	}, [customer, reset]);

	const handleClose = () => {
		reset();
		onClose();
	};

	const submit = (data: CustomerEditFormValues) => {
		onSubmit({ ...data, password: data.password || undefined });
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Editar cliente'
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
				<Input label='Teléfono' error={errors.phone?.message} {...register('phone')} />
				<Input
					label='Nueva contraseña'
					type='password'
					hint='Dejar en blanco para no cambiarla.'
					autoComplete='new-password'
					error={errors.password?.message}
					{...register('password')}
				/>
			</form>
		</Modal>
	);
};
