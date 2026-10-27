import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../../services/order.service';

export const useCustomerOrder = (orderId?: string) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['order', orderId],
		queryFn: () => getOrderById(orderId as string),
		enabled: Boolean(orderId),
		retry: 1,
	});

	return { order: data, isLoading, isError };
};
