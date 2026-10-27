import { useNavigate } from 'react-router-dom';
import { PageHeader, Tabs } from '../../../components/ui';
import { PaymentProofsQueue } from '../../../components/admin/orders/PaymentProofsQueue';
import { usePendingPaymentProofs, useAdminOrders, usePaymentAccounts } from '../../../hooks';

export const AdminPaymentVerificationPage = () => {
	const navigate = useNavigate();
	const { data, isLoading } = usePendingPaymentProofs();
	// Se trae todo el listado (pageSize alto) solo para armar el lookup de
	// pedido/cuenta por id — mismo enfoque que adminOrders.service.ts, que
	// ya pagina en el cliente sobre el listado completo.
	const { orders, isLoading: isLoadingOrders } = useAdminOrders({ pageSize: 1000 });
	const { accounts, isLoading: isLoadingAccounts } = usePaymentAccounts();

	const ordersById = new Map(orders.map(order => [order.id, order]));
	const accountsById = new Map(accounts.map(account => [account.id, account]));

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader title='Pedidos' description='Gestiona los pedidos y verifica los pagos.' />

			<Tabs
				tabs={[
					{ label: 'Pedidos', value: 'pedidos' },
					{ label: 'Verificación de pagos', value: 'pagos' },
					{ label: 'Cuentas de cobro', value: 'cuentas' },
				]}
				value='pagos'
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

			<PaymentProofsQueue
				proofs={data ?? []}
				isLoading={isLoading || isLoadingOrders || isLoadingAccounts}
				ordersById={ordersById}
				accountsById={accountsById}
			/>
		</div>
	);
};
