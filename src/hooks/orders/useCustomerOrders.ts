import { useQuery } from '@tanstack/react-query';
import { getOrdersByCustomer } from '../../services/order.service';

// Pedidos reales del cliente autenticado (api/order/customer/{customerId}),
// en reemplazo de los pedidos simulados en localStorage
// (antes checkoutSimulation.service.ts).
export const useCustomerOrders = (customerId?: string) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['customer-orders', customerId],
		queryFn: () => getOrdersByCustomer(customerId as string),
		enabled: Boolean(customerId),
		retry: 1,
	});

	return { orders: data ?? [], isLoading, isError, refetch };
};
