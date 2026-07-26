import { useQuery } from '@tanstack/react-query';
import { getActiveExchangeRate } from '../../actions';

export const useActiveExchangeRate = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['exchange-rate', 'active'],
		queryFn: getActiveExchangeRate,
		staleTime: 1000 * 60 * 5, // 5 min: no cambia tan seguido como para refrescar en cada render
	});

	return { data, isLoading };
};
