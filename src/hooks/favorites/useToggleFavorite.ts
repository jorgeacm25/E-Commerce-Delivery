import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../../services/favorite.service';
import { showErrorToast } from '../../components/ui';

export const useToggleFavorite = (profileId?: string) => {
	const queryClient = useQueryClient();
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ['favorites', profileId] });

	const { mutate: add, isPending: isAdding } = useMutation({
		mutationFn: (productId: string) => addFavorite(profileId as string, productId),
		onSuccess: invalidate,
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isRemoving } = useMutation({
		mutationFn: (productId: string) => removeFavorite(profileId as string, productId),
		onSuccess: invalidate,
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { add, isAdding, remove, isRemoving };
};
