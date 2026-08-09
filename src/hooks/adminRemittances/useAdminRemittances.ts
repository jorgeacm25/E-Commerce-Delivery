import { useQuery } from '@tanstack/react-query';
import { getAdminRemittances } from '../../services/adminRemittances.service';

export const useAdminRemittances = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-remittances'],
		queryFn: getAdminRemittances,
		retry: 1,
	});

	return { remittances: data ?? [], isLoading, isError };
};
