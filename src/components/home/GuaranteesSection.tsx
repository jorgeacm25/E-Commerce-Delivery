import { useHomeGuarantees } from '../../hooks';
import { Skeleton } from '../ui/Skeleton';
import { homeIconMap } from './homeIcons';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const GuaranteesSkeleton = () => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
		{Array.from({ length: 3 }).map((_, index) => (
			<Skeleton key={index} className='h-28 rounded-2xl' />
		))}
	</div>
);

export const GuaranteesSection = () => {
	const { guarantees, isLoading, isError, refetch } = useHomeGuarantees();

	return (
		<section className='container flex flex-col gap-4 rounded-3xl bg-secondary-50 px-6 py-10 sm:px-10'>
			<SectionHeading title='Nuestras garantías' />

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={guarantees.length === 0}
				onRetry={refetch}
				loadingFallback={<GuaranteesSkeleton />}
				emptyTitle='No pudimos cargar las garantías'
			>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
					{guarantees.map(guarantee => (
						<div key={guarantee.id} className='flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-card card-hover'>
							<span className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-lg text-primary-700'>
								{homeIconMap[guarantee.icon]}
							</span>
							<p className='font-semibold text-neutral-900'>{guarantee.title}</p>
							<p className='text-sm text-neutral-600'>{guarantee.description}</p>
						</div>
					))}
				</div>
			</SectionState>
		</section>
	);
};
