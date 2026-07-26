import { PaymentProofsQueue } from '../../components/dashboard/payments/PaymentProofsQueue';
import { Loader } from '../../components/shared/Loader';
import { usePendingPaymentProofs } from '../../hooks';

export const DashboardPaymentVerificationPage = () => {
	const { data, isLoading } = usePendingPaymentProofs();

	if (isLoading || !data) return <Loader />;

	return (
		<div className='space-y-5'>
			<h1 className='text-2xl font-bold'>Verificación de pagos</h1>

			<PaymentProofsQueue proofs={data} />
		</div>
	);
};
