import { FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Badge, DataTable, DataTableColumn, EmptyState } from '../../components/ui';
import { useAuth, useCustomerOrders } from '../../hooks';
import { CustomerOrder } from '../../interfaces';

const formatDate = (isoDate: string) =>
	new Date(isoDate).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_BADGE_VARIANT: Record<CustomerOrder['status'], 'primary' | 'success' | 'danger' | 'warning'> = {
	Pending: 'warning',
	Paid: 'primary',
	Shipped: 'primary',
	Delivered: 'success',
	Cancelled: 'danger',
};

const STATUS_LABEL: Record<CustomerOrder['status'], string> = {
	Pending: 'Pago pendiente',
	Paid: 'Pago confirmado',
	Shipped: 'En camino',
	Delivered: 'Entregado',
	Cancelled: 'Cancelado',
};

const columns: DataTableColumn<CustomerOrder>[] = [
	{ key: 'id', header: 'Pedido', render: order => `#${order.id.slice(0, 8)}` },
	{ key: 'createdAt', header: 'Fecha', render: order => formatDate(order.createdAt) },
	{
		key: 'status',
		header: 'Estado',
		render: order => <Badge variant={STATUS_BADGE_VARIANT[order.status]}>{STATUS_LABEL[order.status]}</Badge>,
	},
	{ key: 'total', header: 'Total', render: order => `$${order.totalAmount.toFixed(2)}` },
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
			getRowId={order => order.id}
			isLoading={isLoading}
			onRowClick={order => navigate(`/mi-cuenta/pedidos/${order.id}`)}
		/>
	);
};
