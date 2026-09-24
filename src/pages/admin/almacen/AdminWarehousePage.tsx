import { useState } from 'react';
import { FiAlertTriangle, FiMinus, FiPlus } from 'react-icons/fi';
import { Badge, BadgeVariant, Button, DataTable, PageHeader, Select } from '../../../components/ui';
import { RegisterProductInModal } from '../../../components/admin/warehouse/RegisterProductInModal';
import { RegisterProductOutModal } from '../../../components/admin/warehouse/RegisterProductOutModal';
import {
	useRegisterProductIn,
	useRegisterProductOut,
	useStockAlerts,
	useWarehouseHistory,
} from '../../../hooks';
import { formatDateLong } from '../../../helpers';

// Variantes del badge por tipo de movimiento del histórico (el enum del
// backend se serializa como string — JsonStringEnumConverter en
// Program.cs). Cualquier tipo nuevo cae en 'neutral'.
const actionTypeVariant: Record<string, BadgeVariant> = {
	Entrada: 'success',
	Salida: 'warning',
	Creaciones: 'primary',
	Modificaciones: 'secondary',
	Eliminaciones: 'danger',
	login: 'neutral',
};

// GET /api/history devuelve TODO el histórico del sistema (logins,
// clientes, pedidos...) sin filtro server-side. Por defecto se muestran
// solo los movimientos de stock (Entrada/Salida), que es lo que promete el
// subtítulo de la página; el resto queda disponible bajo "Todo el
// histórico".
const historyFilterOptions = [
	{ value: 'movements', label: 'Entradas y salidas' },
	{ value: 'all', label: 'Todo el histórico' },
	{ value: 'Entrada', label: 'Solo entradas' },
	{ value: 'Salida', label: 'Solo salidas' },
];

export const AdminWarehousePage = () => {
	const { alerts, isLoading: isLoadingAlerts } = useStockAlerts();
	const { history, isLoading: isLoadingHistory } = useWarehouseHistory();
	const { mutate: registerIn, isPending: isRegisteringIn } = useRegisterProductIn();
	const { mutate: registerOut, isPending: isRegisteringOut } = useRegisterProductOut();

	const [inModalOpen, setInModalOpen] = useState(false);
	const [outModalOpen, setOutModalOpen] = useState(false);
	const [historyFilter, setHistoryFilter] = useState('movements');

	const filteredHistory = history.filter(entry => {
		if (historyFilter === 'all') return true;
		if (historyFilter === 'movements') return entry.actionType === 'Entrada' || entry.actionType === 'Salida';
		return entry.actionType === historyFilter;
	});

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Almacén'
				description='Alertas de inventario e historial de entradas/salidas.'
				actions={
					<>
						<Button leftIcon={<FiPlus />} onClick={() => setInModalOpen(true)}>
							Registrar entrada
						</Button>
						<Button variant='outline' leftIcon={<FiMinus />} onClick={() => setOutModalOpen(true)}>
							Registrar salida
						</Button>
					</>
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
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<h2 className='text-sm font-semibold text-neutral-900'>Historial de movimientos</h2>

					<Select
						aria-label='Filtrar historial por tipo'
						value={historyFilter}
						onChange={event => setHistoryFilter(event.target.value)}
						options={historyFilterOptions}
						containerClassName='w-full sm:w-64'
					/>
				</div>

				<DataTable
					columns={[
						{
							key: 'type',
							header: 'Tipo',
							render: entry => (
								<Badge variant={actionTypeVariant[entry.actionType] ?? 'neutral'}>
									{entry.actionType}
								</Badge>
							),
						},
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
					data={filteredHistory}
					getRowId={entry => entry.id}
					isLoading={isLoadingHistory}
					emptyTitle='Sin movimientos'
					emptyDescription={
						historyFilter === 'all'
							? 'Todavía no hay historial de almacén registrado.'
							: 'No hay movimientos de este tipo.'
					}
				/>
			</div>

			<RegisterProductInModal
				isOpen={inModalOpen}
				onClose={() => setInModalOpen(false)}
				isSubmitting={isRegisteringIn}
				onSubmit={input => registerIn(input, { onSuccess: () => setInModalOpen(false) })}
			/>

			<RegisterProductOutModal
				isOpen={outModalOpen}
				onClose={() => setOutModalOpen(false)}
				isSubmitting={isRegisteringOut}
				onSubmit={input => registerOut(input, { onSuccess: () => setOutModalOpen(false) })}
			/>
		</div>
	);
};
