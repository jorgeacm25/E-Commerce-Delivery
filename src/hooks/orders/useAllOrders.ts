import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '../../actions';
import { AdminOrdersSearchParams } from '../../interfaces';

// `data` se mantiene como el array de pedidos (no {orders, count}) para no
// romper el consumidor legacy `DashboardOrdersPage.tsx`/`TableOrdersAdmin`,
// que ya tipa `orders` como array. `count` se expone aparte para el admin
// nuevo (paginación).
export const useAllOrders = (params: AdminOrdersSearchParams = {}) => {
	const { data, isLoading } = useQuery({
		queryKey: ['orders', 'admin', params],
		queryFn: () => getAllOrders(params),
	});

	return {
		data: data?.orders,
		count: data?.count ?? 0,
		isLoading,
	};
};
