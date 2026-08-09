import { useQuery } from '@tanstack/react-query';
import { getSupportCases } from '../../services/support.service';

export const useSupportCases = (profileId?: string) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['support-cases', profileId],
		queryFn: () => getSupportCases(profileId as string),
		enabled: Boolean(profileId),
		retry: 1,
	});

	return { cases: data ?? [], isLoading, isError, refetch };
};
