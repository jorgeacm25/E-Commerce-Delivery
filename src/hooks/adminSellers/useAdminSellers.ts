import { useQuery } from '@tanstack/react-query';
import { getAdminSellers } from '../../services/adminSellers.service';

export const useAdminSellers = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-sellers'],
		queryFn: getAdminSellers,
		retry: 1,
	});

	return { sellers: data ?? [], isLoading, isError };
};
