import { Link } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks';
import { useGlobalStore } from '../../store/global.store';
import { Skeleton } from '../ui/Skeleton';

const buttonClass =
	'focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15';

// Con sesión lleva a "Mi cuenta"; sin sesión abre el modal de login
// (ver components/auth/LoginModal).
export const AccountLink = () => {
	const { session, isInitializing } = useAuth();
	const openLoginModal = useGlobalStore(state => state.openLoginModal);

	if (isInitializing) {
		return (
			<span className='inline-flex h-10 w-10 items-center justify-center'>
				<Skeleton variant='circle' className='h-7 w-7 !bg-white/20' />
			</span>
		);
	}

	if (session) {
		return (
			<Link to='/mi-cuenta/pedidos' aria-label='Mi cuenta' className={buttonClass}>
				<FiUser className='text-xl' aria-hidden='true' />
			</Link>
		);
	}

	return (
		<button
			type='button'
			onClick={() => openLoginModal()}
			aria-haspopup='dialog'
			aria-label='Iniciar sesión'
			className={buttonClass}
		>
			<FiUser className='text-xl' aria-hidden='true' />
		</button>
	);
};
