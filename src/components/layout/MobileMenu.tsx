import { NavLink } from 'react-router-dom';
import { mainNavLinks } from '../../constants/navigation';
import { useAuth } from '../../hooks';
import { Drawer } from '../ui';
import { CategoryLinksList } from './CategoryNav';

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: Props) => {
	const { session, signOut } = useAuth();

	const handleLogout = async () => {
		await signOut();
		onClose();
	};

	return (
		<Drawer isOpen={isOpen} onClose={onClose} title='Menú' side='left'>
			<div className='flex flex-col gap-6'>
				<nav className='flex flex-col gap-1'>
					{mainNavLinks.map(link => (
						<NavLink
							key={link.href}
							to={link.href}
							onClick={onClose}
							className={({ isActive }) =>
								`rounded-lg px-3 py-2 text-sm font-medium ${
									isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-100'
								}`
							}
						>
							{link.label}
						</NavLink>
					))}
				</nav>

				<div>
					<p className='px-3 text-xs font-semibold uppercase text-neutral-400'>Categorías</p>
					<CategoryLinksList className='mt-1 flex flex-col gap-1' onNavigate={onClose} />
				</div>

				<div className='flex flex-col gap-1 border-t border-neutral-200 pt-4'>
					{session ? (
						<>
							<NavLink
								to='/mi-cuenta/pedidos'
								onClick={onClose}
								className='rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100'
							>
								Mi cuenta
							</NavLink>
							<button
								onClick={handleLogout}
								className='rounded-lg px-3 py-2 text-left text-sm font-medium text-danger-600 hover:bg-danger-50'
							>
								Cerrar sesión
							</button>
						</>
					) : (
						<>
							<NavLink
								to='/iniciar-sesion'
								onClick={onClose}
								className='rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100'
							>
								Iniciar sesión
							</NavLink>
							<NavLink
								to='/registrarse'
								onClick={onClose}
								className='rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100'
							>
								Crear cuenta
							</NavLink>
						</>
					)}
				</div>
			</div>
		</Drawer>
	);
};
