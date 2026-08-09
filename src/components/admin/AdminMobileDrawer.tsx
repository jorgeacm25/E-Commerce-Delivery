import { Drawer } from '../ui';
import { useAdminUiStore } from '../../store/adminUi.store';
import { AdminNavList } from './AdminNavList';

export const AdminMobileDrawer = () => {
	const mobileNavOpen = useAdminUiStore(state => state.mobileNavOpen);
	const closeMobileNav = useAdminUiStore(state => state.closeMobileNav);

	return (
		<Drawer isOpen={mobileNavOpen} onClose={closeMobileNav} title='Menú' side='left'>
			<AdminNavList onNavigate={closeMobileNav} />
		</Drawer>
	);
};
