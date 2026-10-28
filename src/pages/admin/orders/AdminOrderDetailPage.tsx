import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	ConfirmDialog,
	OrderStatusBadge,
	PageHeader,
	Select,
	Skeleton,
} from '../../../components/ui';
import { useAdminOrderDetail, useAdminOrderStatus } from '../../../hooks';
import { AdminOrderStatus } from '../../../interfaces';
import { formatDateLong, formatPrice } from '../../../helpers';

const statusOptions: { value: AdminOrderStatus; label: string }[] = [
	{ value: 'Pending', label: 'Pendiente' },
	{ value: 'Paid', label: 'Pagado' },
	{ value: 'Shipped', label: 'Enviado' },
	{ value: 'Delivered', label: 'Entregado' },
	{ value: 'Cancelled', label: 'Cancelado' },
];

// Cambiar a estos dos estados es una acción sensible: Delivered genera una
// comisión automática si el pedido tiene vendedor asignado (ver
// CommissionEntity en el backend) y Cancelled es irreversible en la
// práctica — se confirma con diálogo antes de aplicar.
const SENSITIVE_STATUSES: AdminOrderStatus[] = ['Delivered', 'Cancelled'];

export const AdminOrderDetailPage = () => {
	const { id } = useParams<{ id: string }>();

	const { order, isLoading } = useAdminOrderDetail(id);
	const { mutate: changeStatus, isPending } = useAdminOrderStatus();

	const [pendingStatus, setPendingStatus] = useState<AdminOrderStatus | null>(null);

	if (isLoading || !order || !id) {
		return (
			<div className='flex flex-col gap-4'>
				<Skeleton className='h-8 w-48' />
				<Skeleton className='h-64' />
			</div>
		);
	}

	const applyStatus = (status: AdminOrderStatus) => changeStatus({ id, status });

	const handleStatusChange = (status: AdminOrderStatus) => {
		if (SENSITIVE_STATUSES.includes(status)) {
			setPendingStatus(status);
			return;
		}
		applyStatus(status);
	};

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title={`Pedido #${id.slice(0, 8)}`}
				breadcrumb={[{ label: 'Pedidos', href: '/admin/pedidos' }, { label: `#${id.slice(0, 8)}` }]}
				actions={
					<div className='flex items-center gap-2'>
						<OrderStatusBadge status={order.status} />
						<Select
							aria-label='Cambiar estado del pedido'
							value={order.status}
							disabled={isPending}
							onChange={event => handleStatusChange(event.target.value as AdminOrderStatus)}
							options={statusOptions}
						/>
					</div>
				}
			/>

			<div className='overflow-x-auto rounded-xl border border-neutral-300 bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover'>
				<table className='w-full text-left text-sm'>
					<thead className='bg-neutral-50 text-xs font-semibold uppercase text-neutral-500'>
						<tr>
							<th className='px-4 py-3'>Producto</th>
							<th className='px-4 py-3'>Cantidad</th>
							<th className='px-4 py-3'>Total</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-neutral-100'>
						{order.items.map(item => (
							<tr key={item.id}>
								<td className='px-4 py-3 font-medium text-neutral-900'>{item.productName}</td>
								<td className='px-4 py-3'>{item.quantity}</td>
								<td className='px-4 py-3'>{formatPrice(item.price * item.quantity)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className='flex flex-col gap-1 self-end text-sm text-neutral-600 sm:w-72'>
				<div className='flex justify-between font-semibold text-neutral-900'>
					<p>Total</p>
					<p>{formatPrice(order.totalAmount)}</p>
				</div>
				<p className='text-xs text-neutral-500'>Pedido creado el {formatDateLong(order.createdAt)}</p>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='rounded-2xl border border-neutral-300 bg-white p-5 shadow-card card-hover'>
					<h2 className='mb-2 text-sm font-semibold text-neutral-900'>Cliente</h2>
					<p className='text-sm text-neutral-700'>{order.customerName}</p>
					<p className='text-sm text-neutral-500'>{order.customerEmail}</p>
				</div>

				<div className='rounded-2xl border border-neutral-300 bg-white p-5 shadow-card card-hover'>
					<h2 className='mb-2 text-sm font-semibold text-neutral-900'>Dirección de envío</h2>
					<p className='text-sm text-neutral-700'>{order.addressLine1}</p>
					{order.addressLine2 && <p className='text-sm text-neutral-700'>{order.addressLine2}</p>}
					<p className='text-sm text-neutral-500'>
						{order.city}, {order.state}
					</p>
					<p className='text-sm text-neutral-500'>{order.country}</p>
				</div>
			</div>

			<ConfirmDialog
				isOpen={Boolean(pendingStatus)}
				onClose={() => setPendingStatus(null)}
				onConfirm={() => {
					if (pendingStatus) applyStatus(pendingStatus);
					setPendingStatus(null);
				}}
				title={
					pendingStatus === 'Cancelled'
						? '¿Cancelar este pedido?'
						: '¿Marcar este pedido como entregado?'
				}
				description={
					pendingStatus === 'Cancelled'
						? 'Esta acción no se puede deshacer.'
						: 'Si el pedido tiene un vendedor asignado, esto genera su comisión automáticamente. Confirma que el pedido realmente se entregó.'
				}
				confirmLabel='Confirmar'
				variant='danger'
			/>
		</div>
	);
};
