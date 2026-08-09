import { useQuery } from '@tanstack/react-query';
import { getAddresses } from '../../services/address.service';

export const useAddresses = (profileId?: string) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['addresses', profileId],
		queryFn: () => getAddresses(profileId as string),
		enabled: Boolean(profileId),
		retry: 1,
	});

	return { addresses: data ?? [], isLoading, isError, refetch };
};
