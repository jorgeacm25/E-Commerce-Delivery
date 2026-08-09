import {
	FiAlertTriangle,
	FiArchive,
	FiClock,
	FiCreditCard,
	FiDollarSign,
	FiShoppingBag,
	FiTrendingUp,
	FiTruck,
	FiUserCheck,
} from 'react-icons/fi';
import { PageHeader, StatCard } from '../../components/ui';
import { RecentActivityList } from '../../components/admin/dashboard/RecentActivityList';
import {
	useAdminDashboardMockStats,
	useAdminDashboardStats,
	useAdminOrders,
	useAdminSellers,
	useAdminWorkers,
	useLedgerEntries,
	useStockAlerts,
} from '../../hooks';
import { formatCup, formatPrice } from '../../helpers';

// Reemplaza los placeholders "Próximamente" de la Fase B por datos reales
// de los módulos construidos después (Almacén, Pedidos, Vendedores/
// Comisiones, Trabajadores, Contabilidad) — combina hooks ya existentes en
// vez de duplicar su lógica de agregación.
export const AdminOverviewPage = () => {
	const { stats: realStats, isLoading: isLoadingReal } = useAdminDashboardStats();
	const { activity, isLoadingActivity } = useAdminDashboardMockStats();
	const { alerts, isLoading: isLoadingAlerts } = useStockAlerts();
	const { orders: shippedOrders, isLoading: isLoadingShipped } = useAdminOrders({ status: 'Shipped', pageSize: 1000 });
	const { sellers, isLoading: isLoadingSellers } = useAdminSellers();
	const { workers, isLoading: isLoadingWorkers } = useAdminWorkers();
	const { summary: ledgerSummary, isLoading: isLoadingLedger } = useLedgerEntries();

	const lowStockCount = alerts.filter(alert => alert.stock <= 10).length;
	const expiringProductsCount = alerts.filter(
		alert => alert.daysUntilExpiration !== null && alert.daysUntilExpiration <= 30
	).length;
	const pendingCommissionsUsd = sellers.reduce((acc, seller) => acc + seller.pendingCommissionUsd, 0);
	const pendingPayrollUsd = workers.reduce((acc, worker) => acc + worker.pendingAmountUsd, 0);

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader title='Dashboard' description='Resumen del negocio.' />

			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					label='Pedidos hoy'
					value={String(realStats.ordersToday)}
					icon={<FiShoppingBag />}
					isLoading={isLoadingReal}
				/>
				<StatCard
					label='Ventas del mes'
					value={formatPrice(realStats.salesUsdThisMonth)}
					icon={<FiCreditCard />}
					isLoading={isLoadingReal}
				/>
				<StatCard
					label='Ticket promedio'
					value={formatPrice(realStats.avgTicketUsd)}
					icon={<FiTrendingUp />}
					isLoading={isLoadingReal}
				/>
				<StatCard
					label='Tasa de cambio (CUP por USD)'
					value={realStats.activeExchangeRate ? formatCup(realStats.activeExchangeRate) : '—'}
					icon={<FiDollarSign />}
					isLoading={isLoadingReal}
				/>
			</div>

			<div>
				<h2 className='mb-3 text-lg font-semibold text-neutral-900'>Almacén y operación</h2>

				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					<StatCard
						label='Stock bajo'
						value={String(lowStockCount)}
						icon={<FiArchive />}
						isLoading={isLoadingAlerts}
					/>
					<StatCard
						label='Próximos a vencer'
						value={String(expiringProductsCount)}
						icon={<FiClock />}
						isLoading={isLoadingAlerts}
					/>
					<StatCard
						label='Entregas pendientes'
						value={String(shippedOrders.length)}
						icon={<FiTruck />}
						isLoading={isLoadingShipped}
					/>
					<StatCard
						label='Comisiones pendientes'
						value={formatPrice(pendingCommissionsUsd)}
						icon={<FiUserCheck />}
						isLoading={isLoadingSellers}
					/>
					<StatCard
						label='Pagos pendientes'
						value={formatPrice(pendingPayrollUsd)}
						icon={<FiUserCheck />}
						isLoading={isLoadingWorkers}
					/>
					<StatCard
						label='Gastos registrados'
						value={formatPrice(ledgerSummary.expensesUsd)}
						icon={<FiAlertTriangle />}
						isLoading={isLoadingLedger}
					/>
				</div>
			</div>

			<div className='rounded-2xl border border-neutral-200 bg-white p-5 shadow-card'>
				<h2 className='mb-3 text-lg font-semibold text-neutral-900'>Actividad reciente</h2>
				<RecentActivityList items={activity} isLoading={isLoadingActivity} />
			</div>
		</div>
	);
};
