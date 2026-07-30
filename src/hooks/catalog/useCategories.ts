import { useQuery } from '@tanstack/react-query';
import { getCatalogCategories } from '../../services/catalog.service';

export const useCategories = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['catalog', 'categories'],
		queryFn: getCatalogCategories,
		retry: 1,
	});

	return { categories: data ?? [], isLoading, isError, refetch };
};
