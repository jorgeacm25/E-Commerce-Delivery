import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createPaymentProof } from '../../services/paymentProofs.service';

export const useUploadPaymentProof = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, isSuccess } = useMutation({
		mutationFn: createPaymentProof,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
			toast.success('Comprobante enviado, será revisado en breve', { position: 'bottom-right' });
		},
		onError: error => {
			toast.error(error instanceof Error ? error.message : 'No se pudo subir el comprobante', {
				position: 'bottom-right',
			});
		},
	});

	return { mutate, isPending, isSuccess };
};
