import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { cn } from '../../helpers';
import { IconButton } from '../ui';
import { Logo } from '../layout';
import { useAdminUiStore } from '../../store/adminUi.store';
import { AdminNavList } from './AdminNavList';

export const AdminSidebar = () => {
	const sidebarCollapsed = useAdminUiStore(state => state.sidebarCollapsed);
	const toggleSidebar = useAdminUiStore(state => state.toggleSidebar);

	return (
		<aside
			className={cn(
				'hidden shrink-0 flex-col gap-4 border-r border-neutral-200 bg-white p-4 transition-all duration-200 lg:flex',
				sidebarCollapsed ? 'w-20' : 'w-64'
			)}
		>
			<div className='flex items-center justify-between gap-2'>
				{!sidebarCollapsed && <Logo />}
				<IconButton
					icon={sidebarCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
					label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
					onClick={toggleSidebar}
					className={sidebarCollapsed ? 'mx-auto' : undefined}
				/>
			</div>

			<AdminNavList collapsed={sidebarCollapsed} />
		</aside>
	);
};
