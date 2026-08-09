import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { Badge, DataTable, PageHeader, Switch, Tabs, Button } from '../../../components/ui';
import { PaymentAccountFormModal } from '../../../components/admin/payments/PaymentAccountFormModal';
import { usePaymentAccounts, useManagePaymentAccounts } from '../../../hooks';

export const AdminPaymentAccountsPage = () => {
	const navigate = useNavigate();
	const { accounts, isLoading } = usePaymentAccounts();
	const { create, isCreating, setActive } = useManagePaymentAccounts();

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader
				title='Cuentas de cobro'
				description='Cuentas donde los clientes pueden pagar en el checkout.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={() => setModalOpen(true)}>
						Nueva cuenta
					</Button>
				}
			/>

			<Tabs
				tabs={[
					{ label: 'Pedidos', value: 'pedidos' },
					{ label: 'Verificación de pagos', value: 'pagos' },
					{ label: 'Cuentas de cobro', value: 'cuentas' },
				]}
				value='cuentas'
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

			<DataTable
				columns={[
					{
						key: 'tipo',
						header: 'Tipo',
						render: account => <Badge variant='neutral'>{account.tipo}</Badge>,
					},
					{ key: 'titular', header: 'Titular', render: account => account.titular },
					{ key: 'referencia', header: 'Referencia', render: account => account.referencia },
					{ key: 'prioridad', header: 'Prioridad', render: account => account.prioridad },
					{
						key: 'activa',
						header: 'Estado',
						render: account => (
							<div className='flex items-center gap-2'>
								<Switch
									checked={account.activa}
									onChange={checked => setActive({ id: account.id, activa: checked })}
								/>
								<Badge variant={account.activa ? 'success' : 'neutral'}>
									{account.activa ? 'Activa' : 'Inactiva'}
								</Badge>
							</div>
						),
					},
				]}
				data={accounts}
				getRowId={account => account.id}
				isLoading={isLoading}
				emptyTitle='No hay cuentas de cobro'
				emptyDescription='Crea la primera cuenta para que los clientes puedan pagar en el checkout.'
			/>

			<PaymentAccountFormModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				isSubmitting={isCreating}
				onSubmit={values => create(values, { onSuccess: () => setModalOpen(false) })}
			/>
		</div>
	);
};
