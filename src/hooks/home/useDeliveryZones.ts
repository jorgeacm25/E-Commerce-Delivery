import { useQuery } from '@tanstack/react-query';
import { getDeliveryZones } from '../../services/home.service';

export const useDeliveryZones = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'deliveryZones'],
		queryFn: getDeliveryZones,
		retry: 1,
	});

	return { zones: data ?? [], isLoading, isError, refetch };
};
