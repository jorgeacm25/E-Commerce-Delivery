import { useQuery } from '@tanstack/react-query';
import { getOrdersSummary } from '../../actions';

export const useOrdersSummary = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['orders', 'admin', 'summary'],
		queryFn: getOrdersSummary,
	});

	return { summary: data, isLoading };
};
