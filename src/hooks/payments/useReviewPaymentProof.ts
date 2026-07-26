import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmPaymentProof, rejectPaymentProof } from '../../actions';
import toast from 'react-hot-toast';

export const useReviewPaymentProof = () => {
	const queryClient = useQueryClient();

	const invalidate = () => {
		queryClient.invalidateQueries({
			queryKey: ['payment-proofs', 'pending'],
		});
		queryClient.invalidateQueries({ queryKey: ['orders'] });
	};

	const { mutate: confirm, isPending: isConfirming } = useMutation({
		mutationFn: confirmPaymentProof,
		onSuccess: () => {
			invalidate();
			toast.success('Pago confirmado', { position: 'bottom-right' });
		},
		onError: error =>
			toast.error(error.message, { position: 'bottom-right' }),
	});

	const { mutate: reject, isPending: isRejecting } = useMutation({
		mutationFn: rejectPaymentProof,
		onSuccess: () => {
			invalidate();
			toast.success('Comprobante rechazado', {
				position: 'bottom-right',
			});
		},
		onError: error =>
			toast.error(error.message, { position: 'bottom-right' }),
	});

	return { confirm, isConfirming, reject, isRejecting };
};
