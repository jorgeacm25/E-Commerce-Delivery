import { useParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui';

export const CustomerOrderDetailPage = () => {
	const { orderNumber } = useParams<{ orderNumber: string }>();

	return (
		<EmptyState
			title={`Pedido #${orderNumber}`}
			description='El detalle del pedido se conectará con Supabase en una tarea aparte.'
		/>
	);
};
