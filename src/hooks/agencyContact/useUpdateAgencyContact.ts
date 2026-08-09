import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAgencyContact } from '../../services/agencyContact.service';
import { useAuth } from '../auth/useAuth';
import { actorIdsFromProfile } from '../../helpers';
import { showErrorToast, showSuccessToast } from '../../components/ui';

export const useUpdateAgencyContact = () => {
	const queryClient = useQueryClient();
	const { profile } = useAuth();
	const actor = actorIdsFromProfile(profile);

	const { mutate, isPending } = useMutation({
		mutationFn: (whatsappPhone: string) => updateAgencyContact(whatsappPhone, actor.adminId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['agency-contact'] });
			showSuccessToast('Datos de contacto actualizados');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { mutate, isPending };
};
