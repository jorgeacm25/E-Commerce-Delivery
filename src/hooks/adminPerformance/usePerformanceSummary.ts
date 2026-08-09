import { useQuery } from '@tanstack/react-query';
import { getPerformanceSummary } from '../../services/adminPerformance.service';

export const usePerformanceSummary = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-performance'],
		queryFn: getPerformanceSummary,
		retry: 1,
	});

	return { summary: data, isLoading, isError };
};
