import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../../services/favorite.service';
import { showErrorToast } from '../../components/ui';
import { useFavorites } from './useFavorites';

// add/remove siguen recibiendo un `productId` (mismo contrato que antes,
// no toca a FavoriteButton.tsx/CustomerFavoritesPage.tsx): remove resuelve
// acá el id propio del favorito contra la lista ya cacheada por
// useFavorites (misma queryKey, sin pegarle de nuevo al backend), porque
// DELETE /api/favorite/{id} borra por ese id, no por customerId+productId.
export const useToggleFavorite = (customerId?: string) => {
	const queryClient = useQueryClient();
	const { favorites } = useFavorites(customerId);
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ['favorites', customerId] });

	const { mutate: add, isPending: isAdding } = useMutation({
		mutationFn: (productId: string) => addFavorite(customerId as string, productId),
		onSuccess: invalidate,
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isRemoving } = useMutation({
		mutationFn: (productId: string) => {
			const favorite = favorites.find(item => item.productId === productId);
			if (!favorite) throw new Error('No pudimos encontrar ese favorito.');
			return removeFavorite(favorite.id);
		},
		onSuccess: invalidate,
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { add, isAdding, remove, isRemoving };
};
