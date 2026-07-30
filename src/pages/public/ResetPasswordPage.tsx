import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, PasswordInput } from '../../components/ui';
import { useAuth } from '../../hooks';
import { ResetPasswordFormValues, resetPasswordSchema } from '../../lib/authValidators';
import { getAuthErrorMessage } from '../../helpers/authError';

// Página de destino del enlace de recuperación de contraseña
// (`requestPasswordReset`, ver src/services/auth.service.ts). El SDK de
// Supabase detecta el token de la URL automáticamente (detectSessionInUrl,
// activo por defecto) y abre una sesión de recuperación antes de que este
// componente se monte; si no hay sesión, el enlace ya expiró o no es válido.
export const ResetPasswordPage = () => {
	const { session, isInitializing, updatePassword } = useAuth();
	const navigate = useNavigate();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

	const onSubmit = async (values: ResetPasswordFormValues) => {
		setSubmitError(null);

		try {
			await updatePassword(values.password);
			setSuccess(true);
		} catch (error) {
			setSubmitError(getAuthErrorMessage(error));
		}
	};

	if (success) {
		return (
			<div className='container flex justify-center py-12'>
				<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-card'>
					<Alert variant='success' title='Contraseña actualizada'>
						Ya puedes iniciar sesión con tu nueva contraseña.
					</Alert>
					<Button fullWidth className='mt-6' onClick={() => navigate('/iniciar-sesion')}>
						Ir a iniciar sesión
					</Button>
				</div>
			</div>
		);
	}

	if (!isInitializing && !session) {
		return (
			<div className='container flex justify-center py-12'>
				<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-card'>
					<Alert variant='danger' title='Enlace no válido o expirado'>
						Solicita un nuevo enlace de recuperación para restablecer tu contraseña.
					</Alert>
					<Link
						to='/recuperar-contrasena'
						className='mt-6 block text-center text-sm font-medium text-primary-600 hover:underline'
					>
						Solicitar nuevo enlace
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='container flex justify-center py-12'>
			<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-card'>
				<h1 className='text-xl font-bold text-neutral-900'>Restablecer contraseña</h1>
				<p className='mt-1 text-sm text-neutral-500'>Elige tu nueva contraseña.</p>

				<form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 flex flex-col gap-4'>
					{submitError && <Alert variant='danger'>{submitError}</Alert>}

					<PasswordInput
						label='Nueva contraseña'
						required
						autoComplete='new-password'
						error={errors.password?.message}
						{...register('password')}
					/>
					<PasswordInput
						label='Confirmar nueva contraseña'
						required
						autoComplete='new-password'
						error={errors.confirmPassword?.message}
						{...register('confirmPassword')}
					/>

					<Button type='submit' fullWidth isLoading={isSubmitting}>
						Restablecer contraseña
					</Button>
				</form>
			</div>
		</div>
	);
};
