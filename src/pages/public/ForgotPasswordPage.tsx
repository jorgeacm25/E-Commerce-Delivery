import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Alert, Button, Input } from '../../components/ui';
import { useAuth } from '../../hooks';
import { ForgotPasswordFormValues, forgotPasswordSchema } from '../../lib/authValidators';
import { getAuthErrorMessage } from '../../helpers/authError';

export const ForgotPasswordPage = () => {
	const { requestPasswordReset } = useAuth();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [sentTo, setSentTo] = useState<string | null>(null);
	// El backend local todavía no tiene servidor de correo configurado: en
	// Development devuelve el token directo en la respuesta para poder
	// probar el flujo sin email real (ver CustomerController.ForgotPassword).
	const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

	const onSubmit = async (values: ForgotPasswordFormValues) => {
		setSubmitError(null);

		try {
			const { devResetToken } = await requestPasswordReset(values.email);
			setSentTo(values.email);
			if (devResetToken) {
				setDevResetUrl(`${window.location.origin}/restablecer-contrasena?token=${devResetToken}`);
			}
		} catch (error) {
			setSubmitError(getAuthErrorMessage(error));
		}
	};

	return (
		<div className='container flex justify-center py-12'>
			<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-card'>
				<h1 className='text-xl font-bold text-neutral-900'>Recuperar contraseña</h1>
				<p className='mt-1 text-sm text-neutral-500'>
					Te enviaremos un enlace para restablecer tu contraseña.
				</p>

				{sentTo ? (
					<div className='mt-6 flex flex-col gap-4'>
						<Alert variant='success' title='Enlace enviado'>
							Si <strong>{sentTo}</strong> tiene una cuenta registrada, recibirás un correo con
							instrucciones para restablecer tu contraseña.
						</Alert>
						{devResetUrl && (
							<Alert variant='info' title='Modo desarrollo'>
								No hay servidor de correo configurado todavía. Usa este enlace para probar el
								restablecimiento:
								<br />
								<Link
									to={devResetUrl.replace(window.location.origin, '')}
									className='break-all underline'
								>
									{devResetUrl}
								</Link>
							</Alert>
						)}
					</div>
				) : (
					<form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 flex flex-col gap-4'>
						{submitError && <Alert variant='danger'>{submitError}</Alert>}

						<Input
							label='Correo electrónico'
							type='email'
							required
							autoComplete='email'
							error={errors.email?.message}
							{...register('email')}
						/>

						<Button type='submit' fullWidth isLoading={isSubmitting}>
							Enviar enlace
						</Button>
					</form>
				)}

				<p className='mt-6 text-center text-sm text-neutral-500'>
					<Link to='/iniciar-sesion' className='font-medium text-primary-600 hover:underline'>
						Volver a iniciar sesión
					</Link>
				</p>
			</div>
		</div>
	);
};
