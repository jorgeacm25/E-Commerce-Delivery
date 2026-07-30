import { useQuery } from '@tanstack/react-query';
import { getCatalogProductBySlug } from '../../services/catalog.service';

export const useCatalogProduct = (slug: string | undefined) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['catalog', 'product', slug],
		queryFn: () => getCatalogProductBySlug(slug ?? ''),
		enabled: Boolean(slug),
		retry: 1,
	});

	return { product: data ?? null, isLoading, isError, refetch };
};
