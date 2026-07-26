import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadPaymentProof } from '../../actions';
import toast from 'react-hot-toast';

export const useUploadPaymentProof = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending, isSuccess } = useMutation({
		mutationFn: uploadPaymentProof,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['order', variables.orderId],
			});
			toast.success('Comprobante enviado, será revisado en breve', {
				position: 'bottom-right',
			});
		},
		onError: error => {
			toast.error(error.message, {
				position: 'bottom-right',
			});
		},
	});

	return { mutate, isPending, isSuccess };
};
