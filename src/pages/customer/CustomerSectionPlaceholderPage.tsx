import { FiTool } from 'react-icons/fi';
import { EmptyState } from '../../components/ui';

export const CustomerSectionPlaceholderPage = () => {
	return (
		<EmptyState
			icon={<FiTool />}
			title='Sección en construcción'
			description='Esta parte de tu cuenta todavía no está disponible.'
		/>
	);
};
