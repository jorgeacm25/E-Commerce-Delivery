import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExchangeRate } from '../../actions';
import { useAuth } from '../auth/useAuth';
import { actorIdsFromProfile } from '../../helpers';
import toast from 'react-hot-toast';

export const useUpdateExchangeRate = () => {
	const queryClient = useQueryClient();
	const { profile } = useAuth();
	const actor = actorIdsFromProfile(profile);

	const { mutate, isPending } = useMutation({
		mutationFn: (valorCupPorUsd: number) => createExchangeRate(valorCupPorUsd, actor.adminId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['exchange-rate', 'active'],
			});
			toast.success('Tasa de cambio actualizada', {
				position: 'bottom-right',
			});
		},
		onError: error =>
			toast.error(error.message, { position: 'bottom-right' }),
	});

	return { mutate, isPending };
};
