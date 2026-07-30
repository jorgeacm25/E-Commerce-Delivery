import { useQuery } from '@tanstack/react-query';
import { getFeaturedCategories } from '../../services/home.service';

export const useFeaturedCategories = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'featuredCategories'],
		queryFn: getFeaturedCategories,
		retry: 1,
	});

	return { categories: data ?? [], isLoading, isError, refetch };
};
