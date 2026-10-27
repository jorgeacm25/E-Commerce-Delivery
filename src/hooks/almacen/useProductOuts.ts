import { useQuery } from '@tanstack/react-query';
import { getProductOuts } from '../../services/almacen.service';

// Salidas estructuradas por producto (api/productOut) — alimenta la
// columna "Salidas" de la sección Inventario. La queryKey vive bajo
// 'almacen' para que los invalidados de useRegisterProductIn/Out la
// refresquen junto con el histórico.
export const useProductOuts = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['almacen', 'productOuts'],
		queryFn: getProductOuts,
		retry: 1,
	});

	return { productOuts: data ?? [], isLoading, isError };
};
