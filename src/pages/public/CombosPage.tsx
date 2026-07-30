import { ProductGrid } from '../../components/catalog/ProductGrid';
import { SectionState } from '../../components/home/SectionState';
import { PageHeader, Skeleton } from '../../components/ui';
import { useCombos } from '../../hooks';

const CombosSkeleton = () => (
	<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
		{Array.from({ length: 4 }).map((_, index) => (
			<Skeleton key={index} className='h-56 rounded-2xl' />
		))}
	</div>
);

export const CombosPage = () => {
	const { combos, isLoading, isError, refetch } = useCombos();

	return (
		<div className='container flex flex-col gap-6 py-8'>
			<PageHeader
				title='Combos'
				description='Combos familiares con precio especial, listos para enviar.'
				breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Combos' }]}
			/>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={combos.length === 0}
				onRetry={refetch}
				loadingFallback={<CombosSkeleton />}
				emptyTitle='No hay combos disponibles por ahora'
				emptyDescription='Vuelve a intentarlo en unos minutos.'
			>
				<ProductGrid products={combos} />
			</SectionState>
		</div>
	);
};
