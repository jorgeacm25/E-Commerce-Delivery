import { useQuery } from '@tanstack/react-query';
import { AdminProductSearchParams } from '../../interfaces';
import { getAdminProducts } from '../../services/adminProducts.service';

export const useAdminProducts = (params: AdminProductSearchParams) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['admin-products', params],
		queryFn: () => getAdminProducts(params),
		retry: 1,
	});

	return {
		products: data?.items ?? [],
		total: data?.total ?? 0,
		totalPages: data?.totalPages ?? 1,
		isLoading,
		isError,
		refetch,
	};
};
