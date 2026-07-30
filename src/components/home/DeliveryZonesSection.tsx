import { useDeliveryZones } from '../../hooks';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const ZonesSkeleton = () => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
		{Array.from({ length: 6 }).map((_, index) => (
			<Skeleton key={index} className='h-28 rounded-2xl' />
		))}
	</div>
);

export const DeliveryZonesSection = () => {
	const { zones, isLoading, isError, refetch } = useDeliveryZones();

	return (
		<section className='container flex flex-col gap-4'>
			<SectionHeading
				title='Zonas de entrega'
				description='La disponibilidad de productos y los tiempos de entrega dependen del stock y de la provincia del destinatario.'
			/>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={zones.length === 0}
				onRetry={refetch}
				loadingFallback={<ZonesSkeleton />}
				emptyTitle='No pudimos cargar las zonas de entrega'
			>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{zones.map(zone => (
						<div
							key={zone.id}
							className='flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-card'
						>
							<div className='flex items-center justify-between gap-2'>
								<p className='font-semibold text-neutral-900'>{zone.province}</p>
								<Badge variant={zone.available ? 'success' : 'neutral'}>
									{zone.available ? 'Disponible' : 'Próximamente'}
								</Badge>
							</div>
							<p className='text-sm text-neutral-600'>
								{zone.municipalities.join(', ')}
							</p>
							<p className='text-xs text-neutral-500'>
								Entrega estimada: {zone.estimatedDeliveryDays}
							</p>
						</div>
					))}
				</div>
			</SectionState>
		</section>
	);
};
