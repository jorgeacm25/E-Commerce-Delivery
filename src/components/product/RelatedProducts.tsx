import { useRelatedProducts } from '../../hooks';
import { ProductGrid } from '../catalog/ProductGrid';
import { SectionState } from '../home/SectionState';
import { Skeleton } from '../ui/Skeleton';

interface Props {
	slug: string;
}

const RelatedSkeleton = () => (
	<div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
		{Array.from({ length: 4 }).map((_, index) => (
			<Skeleton key={index} className='h-56 rounded-2xl' />
		))}
	</div>
);

export const RelatedProducts = ({ slug }: Props) => {
	const { products, isLoading, isError, refetch } = useRelatedProducts(slug);

	if (!isLoading && !isError && products.length === 0) return null;

	return (
		<section className='flex flex-col gap-4'>
			<h2 className='text-lg font-semibold text-neutral-900'>Productos relacionados</h2>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={products.length === 0}
				onRetry={refetch}
				loadingFallback={<RelatedSkeleton />}
				emptyTitle='Sin productos relacionados'
			>
				<ProductGrid products={products} />
			</SectionState>
		</section>
	);
};
