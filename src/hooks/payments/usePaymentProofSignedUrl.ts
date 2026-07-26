import { useQuery } from '@tanstack/react-query';
import { getPaymentProofSignedUrl } from '../../actions';

export const usePaymentProofSignedUrl = (path: string) => {
	const { data, isLoading } = useQuery({
		queryKey: ['payment-proof-url', path],
		queryFn: () => getPaymentProofSignedUrl(path),
		enabled: !!path,
		staleTime: 1000 * 60 * 50, // la URL firmada dura 1h, refrescamos antes de que expire
	});

	return { url: data, isLoading };
};
