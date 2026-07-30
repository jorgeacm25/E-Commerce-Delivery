import { Link } from 'react-router-dom';
import { useFamilyCombos } from '../../hooks';
import { Badge } from '../ui/Badge';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const CombosSkeleton = () => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
		{Array.from({ length: 4 }).map((_, index) => (
			<Skeleton key={index} className='h-64 rounded-2xl' />
		))}
	</div>
);

export const FamilyCombosSection = () => {
	const { combos, isLoading, isError, refetch } = useFamilyCombos();

	return (
		<section className='container flex flex-col gap-4'>
			<div className='flex items-end justify-between gap-4'>
				<SectionHeading
					title='Combos familiares'
					description='Paquetes pensados para cubrir varias necesidades del hogar en un solo pedido.'
				/>
				<Link
					to='/combos'
					className='focus-ring shrink-0 text-sm font-semibold text-primary-700 hover:text-primary-800'
				>
					Ver todos
				</Link>
			</div>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={combos.length === 0}
				onRetry={refetch}
				loadingFallback={<CombosSkeleton />}
				emptyTitle='No hay combos disponibles por ahora'
				emptyDescription='Estamos preparando nuevos combos familiares. Vuelve pronto.'
			>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{combos.map(combo => (
						<Link
							key={combo.id}
							to='/combos'
							className='focus-ring flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition-shadow hover:shadow-popover'
						>
							<div className='flex h-32 items-center justify-center bg-neutral-50 p-4'>
								<img
									src={combo.imageUrl}
									alt={combo.name}
									className='h-full w-full object-contain'
								/>
							</div>

							<div className='flex flex-1 flex-col gap-2 p-4'>
								<div className='flex items-start justify-between gap-2'>
									<p className='font-semibold text-neutral-900'>{combo.name}</p>
									<Badge variant='secondary'>{combo.itemsCount} items</Badge>
								</div>
								<p className='line-clamp-2 text-sm text-neutral-600'>
									{combo.description}
								</p>
								<CurrencyDisplay usd={combo.priceUsd} className='mt-auto' />
							</div>
						</Link>
					))}
				</div>
			</SectionState>
		</section>
	);
};
