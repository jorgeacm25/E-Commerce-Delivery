import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCombo, setComboActivo } from '../../actions';
import toast from 'react-hot-toast';

export const useManageCombo = () => {
	const queryClient = useQueryClient();

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ['combos'] });

	const { mutate: toggleActivo } = useMutation({
		mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
			setComboActivo(id, activo),
		onSuccess: invalidate,
		onError: error =>
			toast.error(error.message, { position: 'bottom-right' }),
	});

	const { mutate: remove } = useMutation({
		mutationFn: deleteCombo,
		onSuccess: () => {
			invalidate();
			toast.success('Combo eliminado', { position: 'bottom-right' });
		},
		onError: error =>
			toast.error(error.message, { position: 'bottom-right' }),
	});

	return { toggleActivo, remove };
};
