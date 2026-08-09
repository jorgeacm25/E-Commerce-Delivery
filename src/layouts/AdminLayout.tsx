import { Outlet } from 'react-router-dom';
import { RequireAuth } from '../router/RequireAuth';
import { ADMIN_ACCESS_ROLES } from '../lib/roleGuards';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminMobileDrawer } from '../components/admin/AdminMobileDrawer';
import { AdminHeader } from '../components/admin/AdminHeader';

export const AdminLayout = () => {
	return (
		<RequireAuth allowedRoles={ADMIN_ACCESS_ROLES} loginPath='/admin/iniciar-sesion'>
			<div className='flex min-h-screen bg-neutral-50 font-montserrat'>
				<AdminSidebar />
				<AdminMobileDrawer />

				<div className='flex flex-1 flex-col'>
					<AdminHeader />

					<main className='flex-1 p-4 sm:p-6'>
						<Outlet />
					</main>
				</div>
			</div>
		</RequireAuth>
	);
};
