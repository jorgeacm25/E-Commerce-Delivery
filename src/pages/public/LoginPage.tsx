import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Input, PasswordInput } from '../../components/ui';
import { useAuth } from '../../hooks';
import { LoginFormValues, loginSchema } from '../../lib/authValidators';
import { getAuthErrorMessage } from '../../helpers/authError';

interface LocationState {
	from?: { pathname: string };
}

export const LoginPage = () => {
	const { signIn, staffSignIn } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

	const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/';
	// El backend tiene login de cliente y de staff separados (sin una sola
	// identidad unificada, a diferencia de Supabase Auth). Esta pantalla es
	// la misma para ambos: si venías de /admin, se intenta login de staff
	// primero (y cliente como respaldo); si no, al revés. Evita tener una
	// pantalla de login aparte para el panel admin.
	const isStaffDestination = redirectTo.startsWith('/admin');

	const onSubmit = async (values: LoginFormValues) => {
		setSubmitError(null);

		const [primary, fallback] = isStaffDestination ? [staffSignIn, signIn] : [signIn, staffSignIn];

		try {
			await primary(values);
		} catch (primaryError) {
			try {
				await fallback(values);
			} catch {
				setSubmitError(getAuthErrorMessage(primaryError));
				return;
			}
		}

		navigate(redirectTo, { replace: true });
	};

	return (
		<div className='container flex justify-center py-12'>
			<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-card'>
				<h1 className='text-xl font-bold text-neutral-900'>Iniciar sesión</h1>
				<p className='mt-1 text-sm text-neutral-500'>Accede a tu cuenta de Delivery Home.</p>

				<form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 flex flex-col gap-4'>
					{submitError && <Alert variant='danger'>{submitError}</Alert>}

					<Input
						label={isStaffDestination ? 'Correo o usuario' : 'Correo electrónico'}
						type='text'
						required
						autoComplete='username'
						error={errors.email?.message}
						{...register('email')}
					/>
					<PasswordInput
						label='Contraseña'
						required
						autoComplete='current-password'
						error={errors.password?.message}
						{...register('password')}
					/>

					<Link to='/recuperar-contrasena' className='text-right text-xs font-medium text-primary-600 hover:underline'>
						¿Olvidaste tu contraseña?
					</Link>

					<Button type='submit' fullWidth isLoading={isSubmitting}>
						Iniciar sesión
					</Button>
				</form>

				<p className='mt-6 text-center text-sm text-neutral-500'>
					¿No tienes cuenta?{' '}
					<Link to='/registrarse' className='font-medium text-primary-600 hover:underline'>
						Regístrate
					</Link>
				</p>
			</div>
		</div>
	);
};
