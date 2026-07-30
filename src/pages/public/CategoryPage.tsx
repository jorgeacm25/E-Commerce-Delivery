import { Link, useParams } from 'react-router-dom';
import { ProductCatalog } from '../../components/catalog/ProductCatalog';
import { EmptyState, PageHeader } from '../../components/ui';
import { useCategories } from '../../hooks';

export const CategoryPage = () => {
	const { slug } = useParams<{ slug: string }>();
	const { categories, isLoading } = useCategories();
	const category = categories.find(item => item.slug === slug);

	if (!isLoading && !category) {
		return (
			<div className='container flex flex-col gap-8 py-8'>
				<PageHeader
					title='Categoría no encontrada'
					breadcrumb={[
						{ label: 'Inicio', href: '/' },
						{ label: 'Catálogo', href: '/catalogo' },
						{ label: 'Categoría' },
					]}
				/>
				<EmptyState
					title='No encontramos esta categoría'
					description='Puede que ya no esté disponible.'
					action={
						<Link
							to='/catalogo'
							className='focus-ring text-sm font-semibold text-primary-700 hover:underline'
						>
							Ir al catálogo
						</Link>
					}
				/>
			</div>
		);
	}

	const label = category?.name ?? slug ?? 'Categoría';

	return (
		<div className='container flex flex-col gap-6 py-8'>
			<PageHeader
				title={label}
				description={`Productos de la categoría "${label}".`}
				breadcrumb={[
					{ label: 'Inicio', href: '/' },
					{ label: 'Catálogo', href: '/catalogo' },
					{ label },
				]}
			/>

			<ProductCatalog fixedCategorySlug={slug} />
		</div>
	);
};
