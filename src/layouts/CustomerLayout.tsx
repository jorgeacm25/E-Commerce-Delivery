import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks';
import { RequireAuth } from '../router/RequireAuth';
import { Button, PageHeader } from '../components/ui';

const accountLinks = [
	{ label: 'Mis pedidos', href: '/mi-cuenta/pedidos' },
	{ label: 'Perfil', href: '/mi-cuenta/perfil' },
];

export const CustomerLayout = () => {
	const navigate = useNavigate();
	const { signOut } = useAuth();

	const handleLogout = async () => {
		await signOut();
		navigate('/iniciar-sesion');
	};

	return (
		<RequireAuth>
			<div className='container flex flex-col gap-6 py-8'>
				<PageHeader
					title='Mi cuenta'
					breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Mi cuenta' }]}
					actions={
						<Button variant='outline' leftIcon={<FiLogOut />} onClick={handleLogout}>
							Cerrar sesión
						</Button>
					}
				/>

				<nav className='flex gap-1 border-b border-neutral-200'>
					{accountLinks.map(link => (
						<NavLink
							key={link.href}
							to={link.href}
							className={({ isActive }) =>
								`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${
									isActive
										? 'border-primary-600 text-primary-700'
										: 'border-transparent text-neutral-500 hover:text-neutral-800'
								}`
							}
						>
							{link.label}
						</NavLink>
					))}
				</nav>

				<Outlet />
			</div>
		</RequireAuth>
	);
};
