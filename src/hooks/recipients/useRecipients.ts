import { useQuery } from '@tanstack/react-query';
import { getRecipients } from '../../services/recipient.service';

export const useRecipients = (profileId?: string) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['recipients', profileId],
		queryFn: () => getRecipients(profileId as string),
		enabled: Boolean(profileId),
		retry: 1,
	});

	return { recipients: data ?? [], isLoading, isError, refetch };
};
