import { Skeleton } from '../ui/Skeleton';

interface Props {
	numberOfProducts: number;
}

export const ProductGridSkeleton = ({ numberOfProducts }: Props) => {
	return (
		<div className='my-20'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8'>
				{Array.from({ length: numberOfProducts }).map((_, index) => (
					<Skeleton key={index} className='h-[250px] rounded-none' />
				))}
			</div>
		</div>
	);
};
