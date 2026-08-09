import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader, Pagination, SearchInput, Select, Tabs } from '../../../components/ui';
import { OrdersTable } from '../../../components/admin/orders/OrdersTable';
import { useAdminOrders } from '../../../hooks';
import { AdminOrderStatus } from '../../../interfaces';

const PAGE_SIZE = 10;

const statusOptions: { value: AdminOrderStatus; label: string }[] = [
	{ value: 'Pending', label: 'Pendiente' },
	{ value: 'Paid', label: 'Pagado' },
	{ value: 'Shipped', label: 'Enviado' },
	{ value: 'Delivered', label: 'Entregado' },
	{ value: 'Cancelled', label: 'Cancelado' },
];

export const AdminOrdersPage = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get('buscar') ?? '';
	const status = (searchParams.get('estado') as AdminOrderStatus | null) ?? undefined;
	const page = Number(searchParams.get('pagina') ?? '1');

	const updateParams = (updates: Record<string, string | null>) => {
		const next = new URLSearchParams(searchParams);
		Object.entries(updates).forEach(([key, value]) => {
			if (value === null) next.delete(key);
			else next.set(key, value);
		});
		setSearchParams(next);
	};

	const { orders, totalPages, isLoading } = useAdminOrders({
		query: search || undefined,
		status,
		page,
		pageSize: PAGE_SIZE,
	});

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader title='Pedidos' description='Gestiona los pedidos y verifica los pagos.' />

			<Tabs
				tabs={[
					{ label: 'Pedidos', value: 'pedidos' },
					{ label: 'Verificación de pagos', value: 'pagos' },
					{ label: 'Cuentas de cobro', value: 'cuentas' },
				]}
				value='pedidos'
				onChange={value =>
					navigate(
						value === 'pagos'
							? '/admin/pedidos/pagos'
							: value === 'cuentas'
								? '/admin/pedidos/cuentas'
								: '/admin/pedidos'
					)
				}
			/>

			<div className='flex flex-col gap-3 sm:flex-row'>
				<SearchInput
					placeholder='Buscar por número de pedido...'
					value={search}
					onChange={event => updateParams({ buscar: event.target.value || null, pagina: null })}
					onClear={() => updateParams({ buscar: null, pagina: null })}
					containerClassName='sm:max-w-xs'
				/>

				<Select
					placeholder='Todos los estados'
					value={status ?? ''}
					onChange={event => updateParams({ estado: event.target.value || null, pagina: null })}
					options={statusOptions}
					containerClassName='sm:max-w-xs'
				/>
			</div>

			<OrdersTable orders={orders} isLoading={isLoading} />

			<Pagination page={page} totalPages={totalPages} onPageChange={next => updateParams({ pagina: String(next) })} />
		</div>
	);
};
