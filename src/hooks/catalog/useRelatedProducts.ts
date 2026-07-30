import { useQuery } from '@tanstack/react-query';
import { getRelatedProducts } from '../../services/catalog.service';

export const useRelatedProducts = (slug: string | undefined) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['catalog', 'related', slug],
		queryFn: () => getRelatedProducts(slug ?? ''),
		enabled: Boolean(slug),
		retry: 1,
	});

	return { products: data ?? [], isLoading, isError, refetch };
};
