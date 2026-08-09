import { useNavigate } from 'react-router-dom';
import { DataTable, OrderStatusBadge } from '../../ui';
import { AdminOrder } from '../../../interfaces';
import { formatDateLong, formatPrice } from '../../../helpers';

interface Props {
	orders: AdminOrder[];
	isLoading: boolean;
}

export const OrdersTable = ({ orders, isLoading }: Props) => {
	const navigate = useNavigate();

	return (
		<DataTable
			columns={[
				{ key: 'id', header: 'Pedido', render: order => `#${order.id.slice(0, 8)}` },
				{
					key: 'customer',
					header: 'Cliente',
					render: order => (
						<div>
							<p className='font-medium text-neutral-900'>{order.customerName}</p>
							<p className='text-xs text-neutral-500'>{order.customerEmail}</p>
						</div>
					),
				},
				{
					key: 'total',
					header: 'Total',
					render: order => formatPrice(order.totalAmount),
				},
				{
					key: 'status',
					header: 'Estado',
					render: order => <OrderStatusBadge status={order.status} />,
				},
				{
					key: 'date',
					header: 'Fecha',
					render: order => formatDateLong(order.createdAt),
				},
			]}
			data={orders}
			getRowId={order => order.id}
			isLoading={isLoading}
			onRowClick={order => navigate(`/admin/pedidos/${order.id}`)}
			emptyTitle='No hay pedidos'
			emptyDescription='Todavía no se ha registrado ningún pedido con estos filtros.'
		/>
	);
};
