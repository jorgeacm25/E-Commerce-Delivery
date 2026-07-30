import { useQuery } from '@tanstack/react-query';
import { getFamilyCombos } from '../../services/home.service';

export const useFamilyCombos = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'familyCombos'],
		queryFn: getFamilyCombos,
		retry: 1,
	});

	return { combos: data ?? [], isLoading, isError, refetch };
};
