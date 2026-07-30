import { useHowItWorksSteps } from '../../hooks';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const StepsSkeleton = () => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
		{Array.from({ length: 4 }).map((_, index) => (
			<Skeleton key={index} className='h-32 rounded-2xl' />
		))}
	</div>
);

export const HowItWorksSection = () => {
	const { steps, isLoading, isError, refetch } = useHowItWorksSteps();

	return (
		<section className='container flex flex-col gap-4'>
			<SectionHeading
				title='Cómo funciona'
				description='El comprador y el destinatario pueden ser personas distintas: tú compras, alguien más recibe.'
			/>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={steps.length === 0}
				onRetry={refetch}
				loadingFallback={<StepsSkeleton />}
				emptyTitle='No pudimos cargar los pasos del proceso'
			>
				<ol className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{steps
						.slice()
						.sort((a, b) => a.order - b.order)
						.map(step => (
							<li
								key={step.id}
								className='flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card'
							>
								<span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white'>
									{step.order}
								</span>
								<p className='font-semibold text-neutral-900'>{step.title}</p>
								<p className='text-sm text-neutral-600'>{step.description}</p>
							</li>
						))}
				</ol>
			</SectionState>
		</section>
	);
};
