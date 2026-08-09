import { FiBox, FiCreditCard, FiPackage, FiShoppingBag, FiTag } from 'react-icons/fi';
import { AdminActivityItem, AdminActivityType } from '../../../interfaces';
import { Skeleton } from '../../ui';
import { formatDateLong } from '../../../helpers';

interface Props {
	items: AdminActivityItem[];
	isLoading?: boolean;
}

const iconByType: Record<AdminActivityType, React.ReactNode> = {
	order: <FiShoppingBag aria-hidden='true' />,
	payment: <FiCreditCard aria-hidden='true' />,
	product: <FiBox aria-hidden='true' />,
	combo: <FiPackage aria-hidden='true' />,
	category: <FiTag aria-hidden='true' />,
};

export const RecentActivityList = ({ items, isLoading = false }: Props) => {
	if (isLoading) {
		return (
			<div className='flex flex-col gap-3'>
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} variant='rect' className='h-14 w-full' />
				))}
			</div>
		);
	}

	if (items.length === 0) {
		return <p className='text-sm text-neutral-500'>Sin actividad reciente.</p>;
	}

	return (
		<ul className='flex flex-col divide-y divide-neutral-100'>
			{items.map(item => (
				<li key={item.id} className='flex items-start gap-3 py-3'>
					<span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600'>
						{iconByType[item.type]}
					</span>
					<div>
						<p className='text-sm text-neutral-800'>{item.description}</p>
						<p className='text-xs text-neutral-500'>{formatDateLong(item.occurredAt)}</p>
					</div>
				</li>
			))}
		</ul>
	);
};
