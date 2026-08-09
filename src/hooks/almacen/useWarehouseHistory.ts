import { useQuery } from '@tanstack/react-query';
import { getWarehouseHistory } from '../../services/almacen.service';

export const useWarehouseHistory = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['almacen', 'history'],
		queryFn: getWarehouseHistory,
		retry: 1,
	});

	return { history: data ?? [], isLoading, isError };
};
