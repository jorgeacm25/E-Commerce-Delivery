import { useQuery } from '@tanstack/react-query';
import { getStockAlerts } from '../../services/almacen.service';

export const useStockAlerts = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['almacen', 'alerts'],
		queryFn: getStockAlerts,
		retry: 1,
	});

	return { alerts: data ?? [], isLoading, isError };
};
