import { Link } from 'react-router-dom';
import { usePopularProductsHome } from '../../hooks';
import { ProductCard } from '../ui/ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const ProductsSkeleton = () => (
	<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
		{Array.from({ length: 6 }).map((_, index) => (
			<Skeleton key={index} className='h-56 rounded-2xl' />
		))}
	</div>
);

export const PopularProductsSection = () => {
	const { products, isLoading, isError, refetch } = usePopularProductsHome();

	return (
		<section className='container flex flex-col gap-4'>
			<div className='flex items-end justify-between gap-4'>
				<SectionHeading
					title='Productos populares'
					description='Los productos que más piden nuestros compradores para sus familias en Cuba.'
				/>
				<Link
					to='/catalogo'
					className='focus-ring shrink-0 text-sm font-semibold text-primary-700 hover:text-primary-800'
				>
					Ver catálogo
				</Link>
			</div>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={products.length === 0}
				onRetry={refetch}
				loadingFallback={<ProductsSkeleton />}
				emptyTitle='No hay productos populares por ahora'
				emptyDescription='Vuelve a intentarlo en unos minutos.'
			>
				<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
					{products.map(product => (
						<Link key={product.id} to='/catalogo'>
							<ProductCard
								image={product.imageUrl}
								name={product.name}
								price={product.priceUsd}
								inStock={product.inStock}
							/>
						</Link>
					))}
				</div>
			</SectionState>
		</section>
	);
};
