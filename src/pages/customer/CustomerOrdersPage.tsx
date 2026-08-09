import { FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Badge, DataTable, DataTableColumn, EmptyState } from '../../components/ui';
import { useAuth, useCustomerOrders } from '../../hooks';
import { SimulatedOrder } from '../../interfaces';
import {
	ORDER_TRACKING_STAGE_LABELS,
	computeTrackingStage,
} from '../../services/checkoutSimulation.service';

const formatDate = (isoDate: string) =>
	new Date(isoDate).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });

const columns: DataTableColumn<SimulatedOrder>[] = [
	{ key: 'orderNumber', header: 'Pedido', render: order => `#${order.orderNumber}` },
	{ key: 'createdAt', header: 'Fecha', render: order => formatDate(order.createdAt) },
	{
		key: 'status',
		header: 'Estado',
		render: order => <Badge variant='primary'>{ORDER_TRACKING_STAGE_LABELS[computeTrackingStage(order)]}</Badge>,
	},
	{ key: 'total', header: 'Total', render: order => `$${order.totals.total.toFixed(2)}` },
];

export const CustomerOrdersPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { orders, isLoading } = useCustomerOrders(user?.id);

	if (!isLoading && orders.length === 0) {
		return (
			<EmptyState
				icon={<FiPackage />}
				title='Todavía no tienes pedidos'
				description='Cuando hagas tu primera compra, la verás listada aquí.'
			/>
		);
	}

	return (
		<DataTable
			columns={columns}
			data={orders}
			getRowId={order => order.orderNumber}
			isLoading={isLoading}
			onRowClick={order => navigate(`/mi-cuenta/pedidos/${order.orderNumber}`)}
		/>
	);
};
