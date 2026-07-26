import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExchangeRate } from '../../actions';
import toast from 'react-hot-toast';

export const useUpdateExchangeRate = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: createExchangeRate,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['exchange-rate', 'active'],
			});
			toast.success('Tasa de cambio actualizada', {
				position: 'bottom-right',
			});
		},
		onError: error =>
			toast.error(error.message, { position: 'bottom-right' }),
	});

	return { mutate, isPending };
};
