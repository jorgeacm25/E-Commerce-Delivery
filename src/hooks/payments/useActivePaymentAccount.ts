import { useQuery } from '@tanstack/react-query';
import { getActivePaymentAccount } from '../../actions';

export const useActivePaymentAccount = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['payment-account', 'active'],
		queryFn: getActivePaymentAccount,
	});

	return { data, isLoading };
};
