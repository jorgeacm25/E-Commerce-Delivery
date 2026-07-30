import { useQuery } from '@tanstack/react-query';
import { getHomeBenefits } from '../../services/home.service';

export const useHomeBenefits = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'benefits'],
		queryFn: getHomeBenefits,
		retry: 1,
	});

	return { benefits: data ?? [], isLoading, isError, refetch };
};
