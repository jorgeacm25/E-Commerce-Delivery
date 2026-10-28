import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminMobileDrawer } from '../components/admin/AdminMobileDrawer';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminRouteTransition } from '../components/admin/AdminRouteTransition';
import { ParticlesCanvas } from '../components/ui/ParticlesCanvas';

// Sin guarda de sesión/rol en el cliente (decisión del usuario, acceso
// rápido desde el footer). La autorización real sigue en el backend .NET:
// los endpoints protegidos con [Authorize] responden 401/403 sin un JWT
// de staff válido, así que sin iniciar sesión el panel carga pero no
// muestra datos protegidos.
//
// Marco verde del hero (mismo degradado, sin el shader) con partículas
// lentas detrás del sidebar y el header; el contenido va en un panel gris
// claro donde las tarjetas y formularios blancos contrastan.
export const AdminLayout = () => {
	return (
		<div className='relative isolate flex min-h-screen bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800 font-sans'>
			<ParticlesCanvas className='fixed inset-0 -z-10 h-full w-full' />

			<AdminSidebar />
			<AdminMobileDrawer />

			<div className='flex min-w-0 flex-1 flex-col'>
				<AdminHeader />

				<main className='flex-1 rounded-t-3xl bg-[#eef2ef] p-4 shadow-[0_-8px_30px_-12px_rgb(11_36_24/0.35)] sm:p-6 lg:rounded-tr-none'>
					<AdminRouteTransition />
				</main>
			</div>
		</div>
	);
};
