import { useQuery } from '@tanstack/react-query';
import { getTestimonials } from '../../services/home.service';

export const useTestimonials = () => {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['home', 'testimonials'],
		queryFn: getTestimonials,
		retry: 1,
	});

	return { testimonials: data ?? [], isLoading, isError, refetch };
};
