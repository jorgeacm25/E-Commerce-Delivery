import { useQuery } from '@tanstack/react-query';
import { getHomeGuarantees } from '../../services/home.service';

export const useHomeGuarantees = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'guarantees'],
		queryFn: getHomeGuarantees,
		retry: 1,
	});

	return { guarantees: data ?? [], isLoading, isError, refetch };
};
