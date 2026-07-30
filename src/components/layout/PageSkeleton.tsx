import { Skeleton } from '../ui';

export const PageSkeleton = () => {
	return (
		<div className='container flex flex-col gap-4 py-10'>
			<Skeleton variant='text' className='h-8 w-1/3' />
			<Skeleton variant='text' className='w-2/3' />
			<div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{Array.from({ length: 6 }).map((_, index) => (
					<Skeleton key={index} className='h-48 w-full' />
				))}
			</div>
		</div>
	);
};
