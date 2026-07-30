import { FiPackage } from 'react-icons/fi';
import { EmptyState } from '../../components/ui';

export const CustomerOrdersPage = () => {
	return (
		<EmptyState
			icon={<FiPackage />}
			title='Todavía no hay pedidos para mostrar'
			description='Cuando conectemos esta sección con Supabase, aquí verás tu historial de pedidos.'
		/>
	);
};
