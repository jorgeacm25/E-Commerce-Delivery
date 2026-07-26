import { useQuery } from '@tanstack/react-query';
import { getVariantsForComboSelector } from '../../actions';

export const useVariantsForComboSelector = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['variants', 'combo-selector'],
		queryFn: getVariantsForComboSelector,
	});

	return { data, isLoading };
};
