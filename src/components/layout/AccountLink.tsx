import { Link } from 'react-router-dom';
import { FiLoader, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks';

export const AccountLink = () => {
	const { session, isInitializing } = useAuth();

	if (isInitializing) {
		return (
			<span className='inline-flex h-10 w-10 items-center justify-center text-white/70'>
				<FiLoader className='animate-spin-slow' aria-hidden='true' />
			</span>
		);
	}

	return (
		<Link
			to={session ? '/mi-cuenta/pedidos' : '/iniciar-sesion'}
			aria-label={session ? 'Mi cuenta' : 'Iniciar sesión'}
			className='focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15'
		>
			<FiUser className='text-xl' aria-hidden='true' />
		</Link>
	);
};
