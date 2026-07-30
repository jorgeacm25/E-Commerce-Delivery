import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { PageSkeleton } from '../components/layout';

interface Props {
	children: React.ReactNode;
}

// Guarda basada en Supabase Auth: exige una sesión activa.
// La restricción por rol (cliente vs admin) queda pendiente de un hook
// dedicado; hoy la barrera real de datos la impone RLS en Supabase.
export const RequireAuth = ({ children }: Props) => {
	const { session, isInitializing } = useAuth();
	const location = useLocation();

	if (isInitializing) return <PageSkeleton />;

	if (!session) {
		return <Navigate to='/iniciar-sesion' state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
