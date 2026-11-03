import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useGlobalStore } from '../../store/global.store';

interface LocationState {
	from?: { pathname: string };
}

// El login de clientes es un modal (components/auth/LoginModal). La ruta
// /iniciar-sesion se conserva para los enlaces directos y para las
// redirecciones de RequireAuth: abre el modal sobre la portada y, tras
// iniciar sesión, vuelve a la página de origen si la había.
export const LoginPage = () => {
	const { session } = useAuth();
	const location = useLocation();
	const openLoginModal = useGlobalStore(state => state.openLoginModal);

	const redirectTo = (location.state as LocationState | null)?.from?.pathname;

	useEffect(() => {
		if (!session) openLoginModal(redirectTo);
	}, [session, openLoginModal, redirectTo]);

	return <Navigate to={session ? (redirectTo ?? '/') : '/'} replace />;
};
