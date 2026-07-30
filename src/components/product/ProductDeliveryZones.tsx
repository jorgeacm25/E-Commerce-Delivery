import { useDeliveryZones } from '../../hooks';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';

interface Props {
	zoneIds: string[];
}

export const ProductDeliveryZones = ({ zoneIds }: Props) => {
	const { zones, isLoading } = useDeliveryZones();
	const productZones = zones.filter(zone => zoneIds.includes(zone.id));

	if (isLoading) {
		return (
			<div className='flex flex-col gap-2'>
				<span className='text-sm font-medium text-neutral-800'>Zonas de entrega</span>
				<Skeleton className='h-9 w-full rounded-lg' />
			</div>
		);
	}

	if (productZones.length === 0) return null;

	return (
		<div className='flex flex-col gap-2'>
			<span className='text-sm font-medium text-neutral-800'>Zonas de entrega</span>
			<ul className='flex flex-wrap gap-2'>
				{productZones.map(zone => (
					<li key={zone.id}>
						<Badge variant={zone.available ? 'success' : 'neutral'}>
							{zone.province} · {zone.estimatedDeliveryDays}
						</Badge>
					</li>
				))}
			</ul>
		</div>
	);
};
