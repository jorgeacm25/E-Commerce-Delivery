import { useQuery } from '@tanstack/react-query';
import { getActiveAgencyContact } from '../../services/agencyContact.service';

export const useActiveAgencyContact = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['agency-contact', 'active'],
		queryFn: getActiveAgencyContact,
		staleTime: 1000 * 60 * 5, // 5 min: no cambia tan seguido, mismo criterio que useActiveExchangeRate
	});

	return { contact: data ?? null, isLoading };
};
