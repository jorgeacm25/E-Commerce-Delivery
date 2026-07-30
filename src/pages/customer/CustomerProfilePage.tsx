import { FiUser } from 'react-icons/fi';
import { EmptyState } from '../../components/ui';

export const CustomerProfilePage = () => {
	return (
		<EmptyState
			icon={<FiUser />}
			title='Perfil en construcción'
			description='Muy pronto podrás editar aquí tus datos personales y dirección de contacto.'
		/>
	);
};
