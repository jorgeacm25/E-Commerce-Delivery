import { useQuery } from '@tanstack/react-query';
import { getAdminCombos } from '../../services/adminCombos.service';

export const useAdminCombos = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-combos'],
		queryFn: getAdminCombos,
		retry: 1,
	});

	return { combos: data ?? [], isLoading, isError };
};
