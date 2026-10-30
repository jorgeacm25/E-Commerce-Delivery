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

export const AdminLoginPage = () => {
	const { staffSignIn } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

	const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/admin';

	const onSubmit = async (values: LoginFormValues) => {
		setSubmitError(null);

		try {
			await staffSignIn(values);
			navigate(redirectTo, { replace: true });
		} catch (error) {
			setSubmitError(getAuthErrorMessage(error));
		}
	};

	return (
		<div className='container flex justify-center py-12'>
			<div className='w-full max-w-sm rounded-2xl border border-neutral-300 bg-white p-6 shadow-card'>
				<h1 className='text-xl font-bold text-neutral-900'>Acceso administrativo</h1>
				<p className='mt-1 text-sm text-neutral-500'>Panel de gestión de Delivery Home.</p>

				<form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 flex flex-col gap-4'>
					{submitError && <Alert variant='danger'>{submitError}</Alert>}

					<Input
						label='Usuario o correo'
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
			</div>
		</div>
	);
};
