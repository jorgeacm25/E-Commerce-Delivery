import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Badge, Button, ConfirmDialog, DataTable, PageHeader, SearchInput } from '../../../components/ui';
import { CustomerEditModal } from '../../../components/admin/customers/CustomerEditModal';
import { useAdminCustomers, useManageCustomers } from '../../../hooks';
import { formatPrice } from '../../../helpers';
import { AdminCustomer } from '../../../interfaces';

export const AdminCustomersPage = () => {
	const { customers, isLoading } = useAdminCustomers();
	const { update, isUpdating, remove, isDeleting } = useManageCustomers();
	const [query, setQuery] = useState('');
	const [editingCustomer, setEditingCustomer] = useState<AdminCustomer | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

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
					{
						key: 'actions',
						header: '',
						className: 'text-right',
						render: customer => (
							<div className='flex justify-end gap-2'>
								<Button
									size='sm'
									variant='outline'
									leftIcon={<FiEdit2 />}
									onClick={() => setEditingCustomer(customer)}
								>
									Editar
								</Button>
								<Button
									size='sm'
									variant='outline'
									leftIcon={<FiTrash2 />}
									onClick={() => setDeletingId(customer.id)}
								>
									Eliminar
								</Button>
							</div>
						),
					},
				]}
				data={filtered}
				getRowId={customer => customer.id}
				isLoading={isLoading}
				emptyTitle='No hay clientes todavía'
				emptyDescription='Los clientes aparecerán aquí a medida que se registren.'
			/>

			<CustomerEditModal
				isOpen={Boolean(editingCustomer)}
				customer={editingCustomer}
				onClose={() => setEditingCustomer(null)}
				isSubmitting={isUpdating}
				onSubmit={values => {
					if (!editingCustomer) return;
					update({ id: editingCustomer.id, input: values }, { onSuccess: () => setEditingCustomer(null) });
				}}
			/>

			<ConfirmDialog
				isOpen={Boolean(deletingId)}
				onClose={() => setDeletingId(null)}
				onConfirm={() => {
					if (deletingId) remove(deletingId);
					setDeletingId(null);
				}}
				title='¿Eliminar este cliente?'
				description='Se eliminará la cuenta del cliente de forma permanente. Esta acción no se puede deshacer.'
				confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
				variant='danger'
			/>
		</div>
	);
};
