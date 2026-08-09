import { useQuery } from '@tanstack/react-query';
import { getSimulatedOrdersByUserId } from '../../services/checkoutSimulation.service';

// Distinto del resto de src/hooks/orders/* (legacy, dominio "celulares"):
// este hook lee los pedidos simulados del checkout actual (localStorage,
// ver src/services/checkoutSimulation.service.ts) filtrados por el usuario
// autenticado. Se envuelve en useQuery igual que el resto de la app para
// mantener loading/error/refetch consistentes, aunque no golpee Supabase.
export const useCustomerOrders = (userId?: string) => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['customer-orders', userId],
		queryFn: () => getSimulatedOrdersByUserId(userId as string),
		enabled: Boolean(userId),
		retry: 1,
	});

	return { orders: data ?? [], isLoading, isError, refetch };
};
