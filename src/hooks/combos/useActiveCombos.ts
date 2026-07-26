import { useQuery } from '@tanstack/react-query';
import { getActiveCombos } from '../../actions';

export const useActiveCombos = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['combos', 'active'],
		queryFn: getActiveCombos,
	});

	return { data, isLoading };
};
