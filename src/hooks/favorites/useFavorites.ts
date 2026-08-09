import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../../services/favorite.service';

export const useFavorites = (profileId?: string) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['favorites', profileId],
		queryFn: () => getFavorites(profileId as string),
		enabled: Boolean(profileId),
		retry: 1,
	});

	return { favorites: data ?? [], isLoading, isError, refetch };
};
