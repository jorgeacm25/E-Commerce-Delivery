import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateProfileInput, updateProfile } from '../../services/profile.service';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useUpdateProfile = (profileId?: string) => {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: (input: UpdateProfileInput) => updateProfile(profileId as string, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
			showSuccessToast('Perfil actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { mutate, isPending };
};
