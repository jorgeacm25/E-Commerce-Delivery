import { useQuery } from '@tanstack/react-query';
import { getHowItWorksSteps } from '../../services/home.service';

export const useHowItWorksSteps = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'howItWorksSteps'],
		queryFn: getHowItWorksSteps,
		retry: 1,
	});

	return { steps: data ?? [], isLoading, isError, refetch };
};
