import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { PageSkeleton } from '../components/layout';
import { Profile } from '../interfaces';
import { hasRole } from '../lib/roleGuards';
import { showErrorToast } from '../components/ui';

interface Props {
	children: React.ReactNode;
	// Si se pasa, además de exigir sesión activa se exige que
	// profile.role esté en esta lista (ver src/lib/roleGuards.ts). La
	// autorización real la hace el backend .NET en cada endpoint; esto es
	// solo UX para no navegar a pantallas sin acceso.
	allowedRoles?: Profile['role'][];
	// A dónde redirigir si no hay sesión. Cada layout lo fija explícitamente
	// (no se infiere del pathname) — ver AdminLayout (/admin/iniciar-sesion)
	// vs. CustomerLayout (usa el default).
	loginPath?: string;
}

// Guarda basada en el JWT emitido por el backend .NET (ver src/api/auth.ts):
// exige un token de sesión válido y, opcionalmente, un rol permitido.
export const RequireAuth = ({ children, allowedRoles, loginPath = '/iniciar-sesion' }: Props) => {
	const { session, profile, isInitializing, isProfileLoading } = useAuth();
	const location = useLocation();

	if (isInitializing) return <PageSkeleton />;

	if (!session) {
		return <Navigate to={loginPath} state={{ from: location }} replace />;
	}

	if (allowedRoles) {
		// El perfil se resuelve en una consulta aparte de la sesión (ver
		// AuthContext) — hay que esperarlo antes de decidir el acceso por rol.
		if (isProfileLoading) return <PageSkeleton />;

		if (!hasRole(profile?.role, allowedRoles)) {
			showErrorToast('No tienes permisos para acceder a esta sección');
			return <Navigate to='/' replace />;
		}
	}

	return <>{children}</>;
};
