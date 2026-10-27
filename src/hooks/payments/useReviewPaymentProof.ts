import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';
import { reviewPaymentProof } from '../../services/paymentProofs.service';
import { updateAdminOrderStatus } from '../../services/adminOrders.service';
import { RealPaymentProof } from '../../interfaces';

interface ReviewInput {
	proofId: string;
	orderId: string;
	nota?: string;
}

// Confirmar/rechazar un comprobante real (api/paymentProof/{id}/review).
// El backend no cambia el estado del pedido como efecto del review (ver
// ReviewPaymentProofCommandHandler): si se confirma, el frontend marca
// aparte el pedido como 'Paid' vía /api/order/{id}/status, una sola vez.
export const useReviewPaymentProof = () => {
	const queryClient = useQueryClient();
	const { profile } = useAuth();

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['payment-proofs', 'pending'] });
		queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
	};

	const review = (estado: RealPaymentProof['estado'], { proofId, nota }: ReviewInput) => {
		if (!profile) throw new Error('No se pudo identificar al operador que revisa el pago.');
		return reviewPaymentProof({ proofId, operadorId: profile.id, estado: estado as 'confirmado' | 'rechazado', nota });
	};

	const { mutate: confirm, isPending: isConfirming } = useMutation({
		mutationFn: (input: ReviewInput) =>
			review('confirmado', input).then(() => updateAdminOrderStatus({ id: input.orderId, status: 'Paid' })),
		onSuccess: () => {
			invalidate();
			toast.success('Pago confirmado', { position: 'bottom-right' });
		},
		onError: error => toast.error(error instanceof Error ? error.message : 'No se pudo confirmar el pago', { position: 'bottom-right' }),
	});

	const { mutate: reject, isPending: isRejecting } = useMutation({
		mutationFn: (input: ReviewInput) => review('rechazado', input),
		onSuccess: () => {
			invalidate();
			toast.success('Comprobante rechazado', { position: 'bottom-right' });
		},
		onError: error => toast.error(error instanceof Error ? error.message : 'No se pudo rechazar el comprobante', { position: 'bottom-right' }),
	});

	return { confirm, isConfirming, reject, isRejecting };
};
