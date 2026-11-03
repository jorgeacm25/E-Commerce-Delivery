import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiLoader, FiX } from 'react-icons/fi';
import { cn } from '../../helpers';
import { getAuthErrorMessage } from '../../helpers/authError';
import { useAuth } from '../../hooks';
import { LoginFormValues, loginSchema } from '../../lib/authValidators';
import { useGlobalStore } from '../../store/global.store';
import { Alert, Input, PasswordInput, ShineBorder } from '../ui';
import { ModalBackdrop } from '../ui/ModalBackdrop';
import { PointerGlowCanvas } from '../ui/PointerGlowCanvas';

// Duración de la animación de salida (ver `dialog-out`/`overlay-out` en tailwind.config.js)
const EXIT_DURATION_MS = 320;

interface LoginFormProps {
	onSuccess: () => void;
	onNavigateAway: () => void;
}

const LoginForm = ({ onSuccess, onNavigateAway }: LoginFormProps) => {
	const { signIn } = useAuth();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setFocus,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

	useEffect(() => {
		setFocus('email');
	}, [setFocus]);

	const onSubmit = async (values: LoginFormValues) => {
		setSubmitError(null);

		try {
			await signIn(values);
			onSuccess();
		} catch (error) {
			setSubmitError(getAuthErrorMessage(error));
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} noValidate className='mt-6 flex flex-col gap-4'>
				{submitError && <Alert variant='danger'>{submitError}</Alert>}

				<Input
					label='Correo electrónico'
					type='email'
					required
					autoComplete='username'
					placeholder='nombre@correo.com'
					tone='brand'
					error={errors.email?.message}
					{...register('email')}
				/>
				<PasswordInput
					label='Contraseña'
					required
					autoComplete='current-password'
					tone='brand'
					error={errors.password?.message}
					{...register('password')}
				/>

				<Link
					to='/recuperar-contrasena'
					onClick={onNavigateAway}
					className='focus-ring self-end rounded text-xs font-medium text-secondary-100 hover:text-white hover:underline'
				>
					¿Olvidaste tu contraseña?
				</Link>

				{/* Botón con luz interior (`.glow-button`, index.css) y brillo en el borde */}
				<button
					type='submit'
					disabled={isSubmitting}
					aria-busy={isSubmitting || undefined}
					className='glow-button focus-ring mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70'
				>
					<ShineBorder
						borderWidth={1.5}
						duration={8}
						shineColor={['#dcf3e6', '#65bc9a', '#ffffff']}
					/>
					{isSubmitting && <FiLoader className='animate-spin-slow' aria-hidden='true' />}
					Iniciar sesión
				</button>
			</form>

			<p className='mt-6 text-center text-sm text-secondary-100'>
				¿No tienes cuenta?{' '}
				<Link
					to='/registrarse'
					onClick={onNavigateAway}
					className='focus-ring rounded font-semibold text-white hover:underline'
				>
					Regístrate
				</Link>
			</p>
		</>
	);
};

// Login de clientes en modal (sustituye a la antigua página /iniciar-sesion,
// que ahora solo abre este modal). Se abre con `openLoginModal()` del store
// global desde la navbar, el menú móvil o las redirecciones de RequireAuth.
// Mismo panel verde con shader que el carrito (Drawer `tone='brand'`).
export const LoginModal = () => {
	const isOpen = useGlobalStore(state => state.isLoginModalOpen);
	const redirectTo = useGlobalStore(state => state.loginRedirectTo);
	const closeLoginModal = useGlobalStore(state => state.closeLoginModal);
	const navigate = useNavigate();

	// Al cerrar, el panel sigue montado mientras hace la animación de salida;
	// al desmontarse se descarta el formulario (se abre siempre vacío).
	const [isMounted, setIsMounted] = useState(isOpen);
	if (isOpen && !isMounted) setIsMounted(true);
	const isClosing = isMounted && !isOpen;

	useEffect(() => {
		if (!isClosing) return;
		const timeoutId = window.setTimeout(() => setIsMounted(false), EXIT_DURATION_MS);
		return () => window.clearTimeout(timeoutId);
	}, [isClosing]);

	// El foco vuelve al elemento que abrió el modal (p. ej. el botón de la navbar)
	const returnFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		document.body.style.overflow = 'hidden';

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') closeLoginModal();
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleKeyDown);
			returnFocusRef.current?.focus();
		};
	}, [isOpen, closeLoginModal]);

	const handleSuccess = () => {
		closeLoginModal();
		if (redirectTo) navigate(redirectTo, { replace: true });
	};

	if (!isMounted) return null;

	return createPortal(
		<div
			// Durante la salida ya no recibe clics
			className={cn(
				'fixed inset-0 z-50 flex items-center justify-center p-4',
				isClosing && 'pointer-events-none'
			)}
		>
			<ModalBackdrop
				isClosing={isClosing}
				onClick={closeLoginModal}
				colorClassName='bg-secondary-950/40'
			/>

			<div
				role='dialog'
				aria-modal='true'
				aria-labelledby='login-modal-title'
				aria-describedby='login-modal-description'
				className={cn(
					'relative isolate flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-3xl border border-white/15 bg-secondary-800 text-white shadow-popover',
					isClosing ? 'animate-dialog-out' : 'animate-dialog-in'
				)}
			>
				{/* Mismo fondo que el carrito: degradado de respaldo sin WebGL,
				    shader encima y un velo oscuro para el contraste. */}
				<div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10'>
					<div className='absolute inset-0 bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800' />
					<PointerGlowCanvas scaleTo='viewport' className='absolute inset-0' />
					<div className='absolute inset-0 bg-secondary-950/35' />
				</div>

				<button
					type='button'
					aria-label='Cerrar'
					title='Cerrar'
					onClick={closeLoginModal}
					className='focus-ring absolute right-3 top-3 inline-flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-white/15'
				>
					<FiX aria-hidden='true' />
				</button>

				<div className='p-6 sm:p-8'>
					<div className='text-center'>
						<h2 id='login-modal-title' className='text-2xl font-bold text-white sm:text-3xl'>
							Bienvenido de nuevo
						</h2>
						<p id='login-modal-description' className='mt-2 text-sm text-secondary-100'>
							Accede a tu cuenta de Delivery Home.
						</p>
					</div>

					<LoginForm onSuccess={handleSuccess} onNavigateAway={closeLoginModal} />
				</div>
			</div>
		</div>,
		document.body
	);
};
