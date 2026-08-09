import { useState } from 'react';
import { Badge, DataTable, PageHeader, SearchInput } from '../../../components/ui';
import { useAdminCustomers } from '../../../hooks';
import { formatPrice } from '../../../helpers';

export const AdminCustomersPage = () => {
	const { customers, isLoading } = useAdminCustomers();
	const [query, setQuery] = useState('');

	const filtered = query
		? customers.filter(
				customer =>
					customer.fullName.toLowerCase().includes(query.toLowerCase()) ||
					customer.email.toLowerCase().includes(query.toLowerCase())
			)
		: customers;

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader title='Clientes' description='Clientes registrados y su deuda pendiente.' />

			<SearchInput
				placeholder='Buscar por nombre o correo...'
				value={query}
				onChange={event => setQuery(event.target.value)}
				onClear={() => setQuery('')}
				containerClassName='sm:max-w-xs'
			/>

			<DataTable
				columns={[
					{
						key: 'customer',
						header: 'Cliente',
						render: customer => (
							<div>
								<p className='font-medium text-neutral-900'>{customer.fullName}</p>
								<p className='text-xs text-neutral-500'>{customer.email}</p>
							</div>
						),
					},
					{ key: 'phone', header: 'Teléfono', render: customer => customer.phone || '—' },
					{ key: 'orders', header: 'Pedidos', render: customer => customer.ordersCount },
					{
						key: 'debt',
						header: 'Deuda pendiente',
						render: customer =>
							customer.pendingDebtUsd > 0 ? (
								<Badge variant='warning'>{formatPrice(customer.pendingDebtUsd)}</Badge>
							) : (
								<span className='text-neutral-500'>Sin deuda</span>
							),
					},
					{
						key: 'status',
						header: 'Estado',
						render: customer => (
							<Badge variant={customer.status === 'active' ? 'success' : 'neutral'}>
								{customer.status === 'active' ? 'Activo' : customer.status}
							</Badge>
						),
					},
				]}
				data={filtered}
				getRowId={customer => customer.id}
				isLoading={isLoading}
				emptyTitle='No hay clientes todavía'
				emptyDescription='Los clientes aparecerán aquí a medida que se registren.'
			/>
		</div>
	);
};
