import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorker, settleWorker, updateWorker } from '../../services/adminWorkers.service';
import { AdminWorkerInput, AdminWorkerUpdateInput } from '../../interfaces';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageWorkers = () => {
	const queryClient = useQueryClient();
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-workers'] });

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminWorkerInput) => createWorker(input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Trabajador creado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: AdminWorkerUpdateInput }) => updateWorker(id, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Trabajador actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: settle, isPending: isSettling } = useMutation({
		mutationFn: (id: string) => settleWorker(id),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Pago liquidado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, update, isUpdating, settle, isSettling };
};
