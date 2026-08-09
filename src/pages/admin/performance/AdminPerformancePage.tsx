import { FiDollarSign, FiShoppingBag, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { DataTable, PageHeader, StatCard } from '../../../components/ui';
import { usePerformanceSummary } from '../../../hooks';
import { formatPrice } from '../../../helpers';

export const AdminPerformancePage = () => {
	const { summary, isLoading } = usePerformanceSummary();

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Rendimiento'
				description='Ventas, productos más vendidos y desempeño de vendedores.'
			/>

			<div className='grid gap-4 sm:grid-cols-3'>
				<StatCard
					label='Ventas totales'
					value={formatPrice(summary?.totalSalesUsd ?? 0)}
					icon={<FiDollarSign />}
					isLoading={isLoading}
				/>
				<StatCard
					label='Pedidos totales'
					value={String(summary?.totalOrders ?? 0)}
					icon={<FiShoppingBag />}
					isLoading={isLoading}
				/>
				<StatCard
					label='Ticket promedio'
					value={formatPrice(summary?.avgTicketUsd ?? 0)}
					icon={<FiTrendingUp />}
					isLoading={isLoading}
				/>
			</div>

			<div className='flex flex-col gap-3'>
				<h2 className='flex items-center gap-2 text-sm font-semibold text-neutral-900'>
					<FiTarget /> Productos más vendidos
				</h2>
				<DataTable
					columns={[
						{ key: 'product', header: 'Producto', render: product => product.productName },
						{ key: 'quantity', header: 'Cantidad vendida', render: product => product.quantitySold },
						{ key: 'revenue', header: 'Ingresos', render: product => formatPrice(product.revenueUsd) },
					]}
					data={summary?.topProducts ?? []}
					getRowId={product => product.productId}
					isLoading={isLoading}
					emptyTitle='Sin ventas todavía'
					emptyDescription='Los productos más vendidos aparecerán aquí cuando haya pedidos.'
				/>
			</div>

			<div className='flex flex-col gap-3'>
				<h2 className='text-sm font-semibold text-neutral-900'>Desempeño de vendedores</h2>
				<DataTable
					columns={[
						{ key: 'name', header: 'Vendedor', render: seller => seller.fullName },
						{
							key: 'total',
							header: 'Comisión generada',
							render: seller => formatPrice(seller.totalCommissionUsd),
						},
						{
							key: 'settled',
							header: 'Liquidada',
							render: seller => formatPrice(seller.settledCommissionUsd),
						},
						{
							key: 'pending',
							header: 'Pendiente',
							render: seller => formatPrice(seller.pendingCommissionUsd),
						},
					]}
					data={summary?.sellerPerformance ?? []}
					getRowId={seller => seller.sellerId}
					isLoading={isLoading}
					emptyTitle='Sin vendedores todavía'
					emptyDescription='Crea vendedores en el módulo de Vendedores para verlos aquí.'
				/>
			</div>
		</div>
	);
};
