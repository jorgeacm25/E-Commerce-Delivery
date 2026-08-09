import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerRecipientInput } from '../../interfaces';
import { createRecipient, deleteRecipient, updateRecipient } from '../../services/recipient.service';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useManageRecipients = (profileId?: string) => {
	const queryClient = useQueryClient();
	const invalidate = () => queryClient.invalidateQueries({ queryKey: ['recipients', profileId] });

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: CustomerRecipientInput) => createRecipient(profileId as string, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Destinatario guardado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: CustomerRecipientInput }) =>
			updateRecipient(id, input),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Destinatario actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: (id: string) => deleteRecipient(id),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Destinatario eliminado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, update, isUpdating, remove, isDeleting };
};
