import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportCaseInput } from '../../interfaces';
import { createSupportCase } from '../../services/support.service';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useCreateSupportCase = (profileId?: string) => {
	const queryClient = useQueryClient();

	const { mutate, isPending, isSuccess, reset } = useMutation({
		mutationFn: (input: SupportCaseInput) => createSupportCase(profileId as string, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['support-cases', profileId] });
			showSuccessToast('Caso de soporte creado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { mutate, isPending, isSuccess, reset };
};
