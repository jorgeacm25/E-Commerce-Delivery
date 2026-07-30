import { FiTool } from 'react-icons/fi';
import { EmptyState } from '../../components/ui';

export const AdminSectionPlaceholderPage = () => {
	return (
		<EmptyState
			icon={<FiTool />}
			title='Sección en construcción'
			description='Esta parte del panel administrativo todavía no está disponible.'
		/>
	);
};
