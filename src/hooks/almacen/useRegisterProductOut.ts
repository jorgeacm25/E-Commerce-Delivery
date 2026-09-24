import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerProductOut } from '../../services/almacen.service';
import { useAuth } from '../auth/useAuth';
import { actorIdsFromProfile } from '../../helpers';
import { showErrorToast, showSuccessToast } from '../../components/ui';
import { RegisterProductOutInput } from '../../interfaces';

export const useRegisterProductOut = () => {
	const queryClient = useQueryClient();
	const { profile } = useAuth();
	const actor = actorIdsFromProfile(profile);

	const { mutate, isPending } = useMutation({
		mutationFn: (input: RegisterProductOutInput) => registerProductOut(input, actor),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['almacen'] });
			queryClient.invalidateQueries({ queryKey: ['admin-products'] });
			// La salida también cambia el stock que ve el catálogo público
			// (mismas queryKeys que useManageProducts).
			queryClient.invalidateQueries({ queryKey: ['catalog'] });
			queryClient.invalidateQueries({ queryKey: ['home', 'popularProducts'] });
			showSuccessToast('Salida de almacén registrada');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { mutate, isPending };
};
