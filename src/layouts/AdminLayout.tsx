import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminMobileDrawer } from '../components/admin/AdminMobileDrawer';
import { AdminHeader } from '../components/admin/AdminHeader';

// Sin guarda de sesión/rol en el cliente (decisión del usuario, acceso
// rápido desde el footer). La autorización real sigue en el backend .NET:
// los endpoints protegidos con [Authorize] responden 401/403 sin un JWT
// de staff válido, así que sin iniciar sesión el panel carga pero no
// muestra datos protegidos.
export const AdminLayout = () => {
	return (
		<div className='flex min-h-screen bg-neutral-50 font-sans'>
			<AdminSidebar />
			<AdminMobileDrawer />

			<div className='flex flex-1 flex-col'>
				<AdminHeader />

				<main className='flex-1 p-4 sm:p-6'>
					<Outlet />
				</main>
			</div>
		</div>
	);
};
