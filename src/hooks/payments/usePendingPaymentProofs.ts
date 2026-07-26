import { useQuery } from '@tanstack/react-query';
import { getPendingPaymentProofs } from '../../actions';

export const usePendingPaymentProofs = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['payment-proofs', 'pending'],
		queryFn: getPendingPaymentProofs,
		refetchInterval: 30_000, // refresca cada 30s: es la cola operativa del día a día
	});

	return { data, isLoading };
};
