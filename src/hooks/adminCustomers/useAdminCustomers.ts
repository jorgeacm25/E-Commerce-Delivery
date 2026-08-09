import { useQuery } from '@tanstack/react-query';
import { getAdminCustomers } from '../../services/adminCustomers.service';

export const useAdminCustomers = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-customers'],
		queryFn: getAdminCustomers,
		retry: 1,
	});

	return { customers: data ?? [], isLoading, isError };
};
