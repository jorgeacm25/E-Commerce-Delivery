import { Link } from 'react-router-dom';
import { useFeaturedCategories } from '../../hooks';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const CategoriesSkeleton = () => (
	<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
		{Array.from({ length: 6 }).map((_, index) => (
			<Skeleton key={index} className='h-28 rounded-2xl' />
		))}
	</div>
);

export const FeaturedCategoriesSection = () => {
	const { categories, isLoading, isError, refetch } = useFeaturedCategories();

	return (
		<section className='container flex flex-col gap-4'>
			<SectionHeading
				title='Categorías destacadas'
				description='Explora por tipo de producto; la disponibilidad exacta depende del stock y de la zona de entrega.'
			/>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={categories.length === 0}
				onRetry={refetch}
				loadingFallback={<CategoriesSkeleton />}
				emptyTitle='Aún no hay categorías disponibles'
				emptyDescription='Vuelve a intentarlo en unos minutos.'
			>
				<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
					{categories.map(category => (
						<Link
							key={category.id}
							to={`/categoria/${category.slug}`}
							className='focus-ring flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-card transition-shadow hover:shadow-popover'
						>
							<img
								src={category.imageUrl}
								alt=''
								aria-hidden='true'
								className='h-10 w-10 object-contain'
							/>
							<span className='text-sm font-medium text-neutral-700'>
								{category.label}
							</span>
							<span className='text-xs text-neutral-500'>
								{category.productCount} productos
							</span>
						</Link>
					))}
				</div>
			</SectionState>
		</section>
	);
};
