import { useQuery } from '@tanstack/react-query';
import { getAdminWorkers } from '../../services/adminWorkers.service';

export const useAdminWorkers = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-workers'],
		queryFn: getAdminWorkers,
		retry: 1,
	});

	return { workers: data ?? [], isLoading, isError };
};
