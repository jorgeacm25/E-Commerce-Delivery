import { useQuery } from '@tanstack/react-query';
import { getAllCombosAdmin } from '../../actions';

export const useAllCombosAdmin = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['combos', 'all'],
		queryFn: getAllCombosAdmin,
	});

	return { data, isLoading };
};
