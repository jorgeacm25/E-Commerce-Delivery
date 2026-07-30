import { useQuery } from '@tanstack/react-query';
import { getPopularProductsHome } from '../../services/home.service';

export const usePopularProductsHome = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'popularProducts'],
		queryFn: getPopularProductsHome,
		retry: 1,
	});

	return { products: data ?? [], isLoading, isError, refetch };
};
