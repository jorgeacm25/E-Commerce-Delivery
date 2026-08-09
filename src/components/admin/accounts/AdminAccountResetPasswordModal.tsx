import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../../ui';
import {
	AdminAccountResetPasswordValues,
	adminAccountResetPasswordSchema,
} from '../../../lib/adminAccountValidators';

interface Props {
	isOpen: boolean;
	accountName: string;
	onClose: () => void;
	onSubmit: (values: AdminAccountResetPasswordValues) => void;
	isSubmitting: boolean;
}

export const AdminAccountResetPasswordModal = ({ isOpen, accountName, onClose, onSubmit, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AdminAccountResetPasswordValues>({
		resolver: zodResolver(adminAccountResetPasswordSchema),
		defaultValues: { password: '' },
	});

	const handleClose = () => {
		reset({ password: '' });
		onClose();
	};

	const submit = (data: AdminAccountResetPasswordValues) => {
		onSubmit(data);
		reset({ password: '' });
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Restablecer contraseña'
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
				<p className='text-sm text-neutral-500'>
					Nueva contraseña para <span className='font-medium text-neutral-900'>{accountName}</span>.
				</p>
				<Input
					label='Nueva contraseña'
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
