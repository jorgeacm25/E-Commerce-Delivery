import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCombo } from '../../actions';
import toast from 'react-hot-toast';

export const useCreateCombo = () => {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: createCombo,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['combos'] });
			toast.success('Combo creado', { position: 'bottom-right' });
		},
		onError: error =>
			toast.error(error.message, { position: 'bottom-right' }),
	});

	return { mutate, isPending };
};
