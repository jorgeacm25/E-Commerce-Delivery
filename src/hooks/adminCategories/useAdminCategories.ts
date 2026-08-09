import { useQuery } from '@tanstack/react-query';
import { getAdminCategories } from '../../services/adminCategories.service';

export const useAdminCategories = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['admin-categories'],
		queryFn: getAdminCategories,
		retry: 1,
	});

	return { categories: data ?? [], isLoading, isError, refetch };
};
