import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Input, PasswordInput } from '../../components/ui';
import { useAuth } from '../../hooks';
import { RegisterFormValues, registerSchema } from '../../lib/authValidators';
import { getAuthErrorMessage } from '../../helpers/authError';

export const RegisterPage = () => {
	const { signUp } = useAuth();
	const navigate = useNavigate();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

	const onSubmit = async (values: RegisterFormValues) => {
		setSubmitError(null);

		try {
			const { needsEmailConfirmation } = await signUp({
				email: values.email,
				password: values.password,
				fullName: values.fullName,
				phone: values.phone,
			});

			if (needsEmailConfirmation) {
				setConfirmationEmail(values.email);
				return;
			}

			navigate('/');
		} catch (error) {
			setSubmitError(getAuthErrorMessage(error));
		}
	};

	if (confirmationEmail) {
		return (
			<div className='container flex justify-center py-12'>
				<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-card'>
					<Alert variant='success' title='Revisa tu correo'>
						Enviamos un enlace de confirmación a <strong>{confirmationEmail}</strong>. Ábrelo para
						activar tu cuenta antes de iniciar sesión.
					</Alert>

					<Link
						to='/iniciar-sesion'
						className='mt-6 block text-center text-sm font-medium text-primary-600 hover:underline'
					>
						Volver a iniciar sesión
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='container flex justify-center py-12'>
			<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-card'>
				<h1 className='text-xl font-bold text-neutral-900'>Crear cuenta</h1>
				<p className='mt-1 text-sm text-neutral-500'>
					Regístrate para hacer seguimiento a tus pedidos.
				</p>

				<form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 flex flex-col gap-4'>
					{submitError && <Alert variant='danger'>{submitError}</Alert>}

					<Input
						label='Nombre completo'
						required
						autoComplete='name'
						error={errors.fullName?.message}
						{...register('fullName')}
					/>
					<Input
						label='Correo electrónico'
						type='email'
						required
						autoComplete='email'
						error={errors.email?.message}
						{...register('email')}
					/>
					<Input
						label='Teléfono'
						type='tel'
						autoComplete='tel'
						error={errors.phone?.message}
						{...register('phone')}
					/>
					<PasswordInput
						label='Contraseña'
						required
						autoComplete='new-password'
						error={errors.password?.message}
						{...register('password')}
					/>
					<PasswordInput
						label='Confirmar contraseña'
						required
						autoComplete='new-password'
						error={errors.confirmPassword?.message}
						{...register('confirmPassword')}
					/>

					<Button type='submit' fullWidth isLoading={isSubmitting}>
						Crear cuenta
					</Button>
				</form>

				<p className='mt-6 text-center text-sm text-neutral-500'>
					¿Ya tienes cuenta?{' '}
					<Link to='/iniciar-sesion' className='font-medium text-primary-600 hover:underline'>
						Inicia sesión
					</Link>
				</p>
			</div>
		</div>
	);
};
