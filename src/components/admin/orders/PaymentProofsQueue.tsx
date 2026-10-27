import { AdminOrder, AdminPaymentAccount, RealPaymentProof } from '../../../interfaces';
import { EmptyState, Skeleton } from '../../ui';
import { PaymentProofCard } from './PaymentProofCard';

interface Props {
	proofs: RealPaymentProof[];
	isLoading: boolean;
	ordersById: Map<string, AdminOrder>;
	accountsById: Map<string, AdminPaymentAccount>;
}

export const PaymentProofsQueue = ({ proofs, isLoading, ordersById, accountsById }: Props) => {
	if (isLoading) {
		return (
			<div className='flex flex-col gap-4'>
				<Skeleton className='h-40 w-full' />
				<Skeleton className='h-40 w-full' />
			</div>
		);
	}

	if (proofs.length === 0) {
		return (
			<EmptyState
				title='No hay comprobantes pendientes'
				description='Todos los pagos reportados ya fueron revisados.'
			/>
		);
	}

	return (
		<div className='flex flex-col gap-4'>
			{proofs.map(proof => (
				<PaymentProofCard
					key={proof.id}
					proof={proof}
					order={ordersById.get(proof.orderId)}
					account={proof.paymentAccountId ? accountsById.get(proof.paymentAccountId) : undefined}
				/>
			))}
		</div>
	);
};
