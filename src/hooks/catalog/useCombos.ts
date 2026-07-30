import { useQuery } from '@tanstack/react-query';
import { getCombos } from '../../services/catalog.service';

export const useCombos = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['catalog', 'combos'],
		queryFn: getCombos,
		retry: 1,
	});

	return { combos: data ?? [], isLoading, isError, refetch };
};
