import { useNavigate } from 'react-router-dom';
import { PageHeader, Tabs } from '../../../components/ui';
import { PaymentProofsQueue } from '../../../components/admin/orders/PaymentProofsQueue';
import { usePendingPaymentProofs } from '../../../hooks';

export const AdminPaymentVerificationPage = () => {
	const navigate = useNavigate();
	const { data, isLoading } = usePendingPaymentProofs();

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

			<PaymentProofsQueue proofs={data ?? []} isLoading={isLoading} />
		</div>
	);
};
