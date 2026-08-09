import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, PasswordInput } from '../../components/ui';
import { useAuth } from '../../hooks';
import { ChangePasswordFormValues, changePasswordSchema } from '../../lib/accountValidators';

export const CustomerSecurityPage = () => {
	const { updatePassword } = useAuth();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

	const onSubmit = async (data: ChangePasswordFormValues) => {
		setSubmitError(null);
		setSuccess(false);

		try {
			await updatePassword(data.password);
			setSuccess(true);
			reset();
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.');
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='flex max-w-md flex-col gap-4'>
			<h2 className='text-sm font-semibold text-neutral-900'>Cambiar contraseña</h2>

			{success && <Alert variant='success'>Tu contraseña se actualizó correctamente.</Alert>}
			{submitError && <Alert variant='danger'>{submitError}</Alert>}

			<PasswordInput label='Nueva contraseña' required error={errors.password?.message} {...register('password')} />

			<PasswordInput
				label='Confirmar nueva contraseña'
				required
				error={errors.confirmPassword?.message}
				{...register('confirmPassword')}
			/>

			<Button type='submit' isLoading={isSubmitting} className='self-start'>
				Actualizar contraseña
			</Button>
		</form>
	);
};
