import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminProductInput } from '../../interfaces';
import { useAuth } from '../auth/useAuth';
import { createProduct, updateProduct } from '../../services/adminProducts.service';
import { showErrorToast, showSuccessToast } from '../../components/ui';
import { actorIdsFromProfile } from '../../helpers';

export const useManageProducts = () => {
	const queryClient = useQueryClient();
	const { profile } = useAuth();
	const actor = actorIdsFromProfile(profile);
	// El catálogo público (src/services/catalog.service.ts) lee del mismo
	// backend (api/product) pero con sus propias queryKeys ('catalog', ...) —
	// hay que invalidarlas aparte para que una foto/precio/stock nuevo se vea
	// ahí sin esperar a que expire el staleTime por defecto.
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ['admin-products'] });
		queryClient.invalidateQueries({ queryKey: ['catalog'] });
		queryClient.invalidateQueries({ queryKey: ['home', 'popularProducts'] });
	};

	const { mutate: create, isPending: isCreating } = useMutation({
		mutationFn: (input: AdminProductInput) => createProduct(input, actor),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Producto creado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	const { mutate: update, isPending: isUpdating } = useMutation({
		mutationFn: ({
			id,
			input,
			currentImages,
			currentEndDate,
		}: {
			id: string;
			input: AdminProductInput;
			currentImages: string[];
			currentEndDate: string;
		}) => updateProduct(id, input, actor, currentImages, currentEndDate),
		onSuccess: () => {
			invalidate();
			showSuccessToast('Producto actualizado');
		},
		onError: (error: Error) => showErrorToast(error.message),
	});

	return { create, isCreating, update, isUpdating };
};
