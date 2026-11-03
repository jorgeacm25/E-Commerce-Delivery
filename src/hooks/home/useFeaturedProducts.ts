import { useQuery } from '@tanstack/react-query';
import { getFeaturedProducts } from '../../services/home.service';

export const useFeaturedProducts = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'featuredProducts'],
		queryFn: getFeaturedProducts,
		retry: 1,
	});

	return { products: data ?? [], isLoading, isError, refetch };
};
