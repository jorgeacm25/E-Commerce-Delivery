import { useSearchParams } from 'react-router-dom';
import { ProductCatalog } from '../../components/catalog/ProductCatalog';
import { PageHeader } from '../../components/ui';

export const CatalogPage = () => {
	const [searchParams] = useSearchParams();
	const query = searchParams.get('buscar');

	return (
		<div className='container flex flex-col gap-6 py-8'>
			<PageHeader
				title={query ? `Resultados de búsqueda para "${query}"` : 'Catálogo'}
				description={
					query
						? 'Ajusta los filtros para acotar los resultados.'
						: 'Explora todos los productos y combos disponibles.'
				}
				breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Catálogo' }]}
			/>

			<ProductCatalog />
		</div>
	);
};
