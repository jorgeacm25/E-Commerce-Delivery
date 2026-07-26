import { PaymentProofWithOrder } from '../../../interfaces';
import { PaymentProofCard } from './PaymentProofCard';

interface Props {
	proofs: PaymentProofWithOrder[];
}

export const PaymentProofsQueue = ({ proofs }: Props) => {
	if (proofs.length === 0) {
		return (
			<p className='text-sm text-gray-600'>
				No hay comprobantes pendientes de revisión.
			</p>
		);
	}

	return (
		<div className='flex flex-col gap-4'>
			{proofs.map(proof => (
				<PaymentProofCard key={proof.id} proof={proof} />
			))}
		</div>
	);
};
