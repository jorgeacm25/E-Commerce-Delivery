import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCombo, deleteCombo, updateCombo } from '../../services/adminCombos.service';
import { AdminComboInput } from '../../interfaces';
import { useAuth } from '../auth/useAuth';
import { actorIdsFromProfile } from '../../helpers';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageCombos = () => {
	const queryClient = useQueryClient();
	const { profile } = useAuth();
	const actor = actorIdsFromProfile(profile);

	// El catálogo público (getCombos en catalog.service.ts) lee del mismo
	// backend (api/combo) con sus propias queryKeys — hay que invalidarlas
	// aparte para que un combo nuevo/editado se vea sin esperar el staleTime.
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['admin-combos'] });
		queryClient.invalidateQueries({ queryKey: ['catalog'] });
	};

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminComboInput) => createCombo(input, actor),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Combo creado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: AdminComboInput }) => updateCombo(id, input, actor),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Combo actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: (id: string) => deleteCombo(id, actor),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Combo eliminado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, update, isUpdating, remove, isDeleting };
};
