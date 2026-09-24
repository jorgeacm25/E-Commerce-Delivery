import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerProductIn } from '../../services/almacen.service';
import { useAuth } from '../auth/useAuth';
import { actorIdsFromProfile } from '../../helpers';
import { showErrorToast, showSuccessToast } from '../../components/ui';
import { RegisterProductInInput } from '../../interfaces';

export const useRegisterProductIn = () => {
	const queryClient = useQueryClient();
	const { profile } = useAuth();
	const actor = actorIdsFromProfile(profile);

	const { mutate, isPending } = useMutation({
		mutationFn: (input: RegisterProductInInput) => registerProductIn(input, actor),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['almacen'] });
			queryClient.invalidateQueries({ queryKey: ['admin-products'] });
			// El stock nuevo afecta también la disponibilidad que muestra el
			// catálogo público (mismas queryKeys que useManageProducts).
			queryClient.invalidateQueries({ queryKey: ['catalog'] });
			queryClient.invalidateQueries({ queryKey: ['home', 'popularProducts'] });
			showSuccessToast('Entrada de almacén registrada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { mutate, isPending };
};
