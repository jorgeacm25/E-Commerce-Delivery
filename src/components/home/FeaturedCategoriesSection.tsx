import { Link } from 'react-router-dom';
import { useFeaturedCategories } from '../../hooks';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const CategoriesSkeleton = () => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
		{Array.from({ length: 4 }).map((_, index) => (
			<Skeleton key={index} className='h-64 rounded-2xl' />
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
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{categories.map(category => (
						<Link
							key={category.id}
							to={`/categoria/${category.slug}`}
							className='focus-ring flex min-h-64 flex-col overflow-hidden rounded-2xl glass-card card-hover'
						>
							<div className='flex h-32 items-center justify-center bg-white/40 p-4'>
								<img
									src={category.imageUrl}
									alt=''
									aria-hidden='true'
									className='h-full w-full object-contain'
								/>
							</div>

							<div className='flex flex-1 flex-col gap-2 p-4'>
								<p className='font-semibold text-neutral-900'>{category.label}</p>
								<p className='mt-auto text-sm text-neutral-600'>
									{category.productCount} productos
								</p>
							</div>
						</Link>
					))}
				</div>
			</SectionState>
		</section>
	);
};
