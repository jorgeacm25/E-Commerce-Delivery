import { useQuery } from '@tanstack/react-query';
import { getHomeFaqs } from '../../services/home.service';

export const useHomeFaqs = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'faqs'],
		queryFn: getHomeFaqs,
		retry: 1,
	});

	return { faqs: data ?? [], isLoading, isError, refetch };
};
