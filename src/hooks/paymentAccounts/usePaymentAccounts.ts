import { useQuery } from '@tanstack/react-query';
import { getPaymentAccounts } from '../../services/paymentAccounts.service';

export const usePaymentAccounts = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-payment-accounts'],
		queryFn: getPaymentAccounts,
		retry: 1,
	});

	return { accounts: data ?? [], isLoading, isError };
};
