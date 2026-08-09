import { useQuery } from '@tanstack/react-query';
import { getMunicipalities, getProvinces } from '../../services/adminDeliveryZones.service';

export const useAdminProvinces = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-provinces'],
		queryFn: getProvinces,
		retry: 1,
	});

	return { provinces: data ?? [], isLoading, isError };
};

export const useAdminMunicipalities = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-municipalities'],
		queryFn: getMunicipalities,
		retry: 1,
	});

	return { municipalities: data ?? [], isLoading, isError };
};
