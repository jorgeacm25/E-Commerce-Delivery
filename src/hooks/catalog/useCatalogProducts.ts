import { useQuery } from '@tanstack/react-query';
import { getCatalogProducts } from '../../services/catalog.service';
import { ProductSearchParams, ProductSearchResult } from '../../interfaces';

const emptyResult: ProductSearchResult = {
	items: [],
	total: 0,
	page: 1,
	pageSize: 0,
	totalPages: 0,
};

export const useCatalogProducts = (params: ProductSearchParams) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['catalog', 'products', params],
		queryFn: () => getCatalogProducts(params),
		retry: 1,
	});

	return { result: data ?? emptyResult, isLoading, isError, refetch };
};
