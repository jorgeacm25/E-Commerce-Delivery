import { useState } from 'react';
import { FiAlertTriangle, FiPlus } from 'react-icons/fi';
import { Badge, Button, DataTable, PageHeader } from '../../../components/ui';
import { RegisterProductOutModal } from '../../../components/admin/warehouse/RegisterProductOutModal';
import { useStockAlerts, useWarehouseHistory, useRegisterProductOut } from '../../../hooks';
import { formatDateLong } from '../../../helpers';

export const AdminWarehousePage = () => {
	const { alerts, isLoading: isLoadingAlerts } = useStockAlerts();
	const { history, isLoading: isLoadingHistory } = useWarehouseHistory();
	const { mutate: registerOut, isPending } = useRegisterProductOut();

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Almacén'
				description='Alertas de inventario e historial de entradas/salidas.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={() => setModalOpen(true)}>
						Registrar salida
					</Button>
				}
			/>

			<div className='flex flex-col gap-3'>
				<h2 className='flex items-center gap-2 text-sm font-semibold text-neutral-900'>
					<FiAlertTriangle className='text-warning-500' />
					Alertas de stock bajo y vencimiento
				</h2>

				<DataTable
					columns={[
						{ key: 'product', header: 'Producto', render: alert => alert.productName },
						{
							key: 'stock',
							header: 'Stock',
							render: alert => (
								<span>
									{alert.stock} {alert.unit}
									{alert.stock <= 10 && (
										<Badge variant='warning' className='ml-2'>
											Bajo
										</Badge>
									)}
								</span>
							),
						},
						{
							key: 'expiration',
							header: 'Vencimiento',
							render: alert =>
								alert.daysUntilExpiration !== null && alert.daysUntilExpiration <= 30 ? (
									<span className='flex items-center gap-2'>
										{alert.endDate ? formatDateLong(alert.endDate) : '—'}
										<Badge variant={alert.daysUntilExpiration < 0 ? 'danger' : 'warning'}>
											{alert.daysUntilExpiration < 0
												? 'Vencido'
												: `En ${alert.daysUntilExpiration} días`}
										</Badge>
									</span>
								) : (
									alert.endDate ? formatDateLong(alert.endDate) : '—'
								),
						},
					]}
					data={alerts}
					getRowId={alert => alert.productId}
					isLoading={isLoadingAlerts}
					emptyTitle='Sin alertas'
					emptyDescription='Ningún producto tiene stock bajo ni vencimiento próximo.'
				/>
			</div>

			<div className='flex flex-col gap-3'>
				<h2 className='text-sm font-semibold text-neutral-900'>Historial de movimientos</h2>

				<DataTable
					columns={[
						{ key: 'type', header: 'Tipo', render: entry => entry.actionType },
						{ key: 'responsable', header: 'Responsable', render: entry => entry.userOrAdminUserName },
						{
							key: 'mensaje',
							header: 'Detalle',
							render: entry => (
								<pre className='whitespace-pre-wrap font-sans text-sm'>{entry.description}</pre>
							),
						},
						{
							key: 'fecha',
							header: 'Fecha',
							render: entry => formatDateLong(entry.createdAt),
						},
					]}
					data={history}
					getRowId={entry => entry.id}
					isLoading={isLoadingHistory}
					emptyTitle='Sin movimientos'
					emptyDescription='Todavía no hay historial de almacén registrado.'
				/>
			</div>

			<RegisterProductOutModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				isSubmitting={isPending}
				onSubmit={input => registerOut(input, { onSuccess: () => setModalOpen(false) })}
			/>
		</div>
	);
};
