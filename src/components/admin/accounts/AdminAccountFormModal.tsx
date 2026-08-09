import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, Select } from '../../ui';
import { AdminAccountFormValues, adminAccountFormSchema } from '../../../lib/adminAccountValidators';

const emptyValues: AdminAccountFormValues = {
	fullName: '',
	userName: '',
	password: '',
	accountType: 'admin',
};

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: AdminAccountFormValues) => void;
	isSubmitting: boolean;
}

export const AdminAccountFormModal = ({ isOpen, onClose, onSubmit, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AdminAccountFormValues>({
		resolver: zodResolver(adminAccountFormSchema),
		defaultValues: emptyValues,
	});

	const handleClose = () => {
		reset(emptyValues);
		onClose();
	};

	const submit = (data: AdminAccountFormValues) => {
		onSubmit(data);
		reset(emptyValues);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Nueva cuenta de staff'
			footer={
				<>
					<Button variant='outline' onClick={handleClose}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit(submit)} isLoading={isSubmitting}>
						Crear cuenta
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit(submit)} className='flex flex-col gap-4'>
				<Select
					label='Tipo de cuenta'
					required
					hint='Administrador: permisos completos, incluye gestionar otras cuentas. Staff: acceso operativo normal.'
					error={errors.accountType?.message}
					options={[
						{ value: 'admin', label: 'Administrador (permisos completos)' },
						{ value: 'user', label: 'Staff' },
					]}
					{...register('accountType')}
				/>
				<Input label='Nombre completo' required error={errors.fullName?.message} {...register('fullName')} />
				<Input
					label='Usuario'
					required
					autoComplete='off'
					error={errors.userName?.message}
					{...register('userName')}
				/>
				<Input
					label='Contraseña'
					type='password'
					required
					autoComplete='new-password'
					error={errors.password?.message}
					{...register('password')}
				/>
			</form>
		</Modal>
	);
};
