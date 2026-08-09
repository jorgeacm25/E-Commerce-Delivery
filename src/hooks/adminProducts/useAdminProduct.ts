import { useQuery } from '@tanstack/react-query';
import { getAdminProductById } from '../../services/adminProducts.service';

export const useAdminProduct = (id?: string) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-products', 'detail', id],
		queryFn: () => getAdminProductById(id as string),
		enabled: Boolean(id),
		retry: 1,
	});

	return { product: data, isLoading, isError };
};
