import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { IconButton, SearchInput, Dropdown } from '../ui';
import { useAuth } from '../../hooks';
import { useAdminUiStore } from '../../store/adminUi.store';
import { AdminDateRangeSelector } from './AdminDateRangeSelector';

// Búsqueda global: MVP simplificado, no es un índice unificado real. Si el
// texto es solo dígitos se interpreta como número de pedido; en cualquier
// otro caso se busca en la sección Inventario (pestaña Productos).
const resolveSearchDestination = (query: string) =>
	/^\d+$/.test(query.trim())
		? `/admin/pedidos?buscar=${encodeURIComponent(query.trim())}`
		: `/admin/inventario?buscar=${encodeURIComponent(query.trim())}`;

export const AdminHeader = () => {
	const navigate = useNavigate();
	const { profile, signOut } = useAuth();
	const openMobileNav = useAdminUiStore(state => state.openMobileNav);
	const [searchQuery, setSearchQuery] = useState('');

	const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!searchQuery.trim()) return;
		navigate(resolveSearchDestination(searchQuery));
	};

	const handleLogout = async () => {
		await signOut();
		navigate('/admin/iniciar-sesion');
	};

	const initials = (profile?.fullName || 'Admin')
		.split(' ')
		.map(part => part[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<header className='flex flex-col gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
			<div className='flex items-center gap-3'>
				<IconButton
					icon={<FiMenu />}
					label='Abrir menú'
					onClick={openMobileNav}
					className='lg:hidden'
				/>

				<form onSubmit={handleSearchSubmit} className='w-56 sm:w-72'>
					<SearchInput
						placeholder='Buscar productos o pedidos...'
						value={searchQuery}
						onChange={event => setSearchQuery(event.target.value)}
						onClear={() => setSearchQuery('')}
					/>
				</form>
			</div>

			<div className='flex flex-wrap items-center gap-2'>
				<AdminDateRangeSelector />

				<Dropdown
					trigger={
						<span
							aria-label='Notificaciones'
							className='flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100'
						>
							<FiBell aria-hidden='true' />
						</span>
					}
					items={[{ label: 'Sin notificaciones nuevas', value: 'empty', disabled: true }]}
					onSelect={() => {}}
					align='right'
				/>

				<Dropdown
					trigger={
						<span className='flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700'>
							{initials}
						</span>
					}
					items={[
						{ label: 'Mi cuenta', value: 'account', icon: <FiUser /> },
						{ label: 'Cerrar sesión', value: 'logout', icon: <FiLogOut />, danger: true },
					]}
					onSelect={value => {
						if (value === 'account') navigate('/mi-cuenta/perfil');
						if (value === 'logout') handleLogout();
					}}
					align='right'
				/>
			</div>
		</header>
	);
};
