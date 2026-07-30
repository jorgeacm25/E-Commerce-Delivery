import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks';
import { RequireAuth } from '../router/RequireAuth';
import { IconButton } from '../components/ui';
import { Logo } from '../components/layout';

const adminLinks = [{ label: 'Resumen', href: '/admin' }];

export const AdminLayout = () => {
	const navigate = useNavigate();
	const { signOut } = useAuth();

	const handleLogout = async () => {
		await signOut();
		navigate('/iniciar-sesion');
	};

	return (
		<RequireAuth>
			<div className='flex min-h-screen bg-neutral-50 font-montserrat'>
				<aside className='hidden w-60 shrink-0 flex-col gap-1 border-r border-neutral-200 bg-white p-4 lg:flex'>
					<Logo className='mb-6' />

					{adminLinks.map(link => (
						<NavLink
							key={link.href}
							to={link.href}
							end
							className={({ isActive }) =>
								`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
									isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-100'
								}`
							}
						>
							<FiGrid aria-hidden='true' />
							{link.label}
						</NavLink>
					))}
				</aside>

				<div className='flex flex-1 flex-col'>
					<header className='flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4'>
						<p className='text-sm font-semibold text-neutral-900'>Panel administrativo</p>
						<IconButton icon={<FiLogOut />} label='Cerrar sesión' onClick={handleLogout} />
					</header>

					<main className='flex-1 p-6'>
						<Outlet />
					</main>
				</div>
			</div>
		</RequireAuth>
	);
};
