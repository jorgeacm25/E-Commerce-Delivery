import { useQuery } from '@tanstack/react-query';
import { getAdminProducts } from '../../services/adminProducts.service';

// Reutiliza el listado real de productos (mismo que /admin/productos) para
// elegir qué incluir en un combo — el backend arma combos con productos
// reales por id + cantidad, sin variantes.
export const useProductsForComboSelector = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['admin-products', 'combo-selector'],
		queryFn: () => getAdminProducts({ pageSize: 500 }),
	});

	return { products: data?.items ?? [], isLoading };
};
