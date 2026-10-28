import { useHomeBenefits } from '../../hooks';
import { Skeleton } from '../ui/Skeleton';
import { homeIconMap } from './homeIcons';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const BenefitsSkeleton = () => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
		{Array.from({ length: 4 }).map((_, index) => (
			<Skeleton key={index} className='h-28 rounded-2xl' />
		))}
	</div>
);

export const BenefitsSection = () => {
	const { benefits, isLoading, isError, refetch } = useHomeBenefits();

	return (
		<section className='container flex flex-col gap-4'>
			<SectionHeading title='Beneficios de comprar con nosotros' />

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={benefits.length === 0}
				onRetry={refetch}
				loadingFallback={<BenefitsSkeleton />}
				emptyTitle='No pudimos cargar los beneficios'
			>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{benefits.map(benefit => (
						<div
							key={benefit.id}
							className='flex flex-col gap-2 rounded-2xl glass-card p-5 card-hover'
						>
							<span className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-lg text-secondary-700'>
								{homeIconMap[benefit.icon]}
							</span>
							<p className='font-semibold text-neutral-900'>{benefit.title}</p>
							<p className='text-sm text-neutral-600'>{benefit.description}</p>
						</div>
					))}
				</div>
			</SectionState>
		</section>
	);
};
