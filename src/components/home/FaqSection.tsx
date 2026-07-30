import { Link } from 'react-router-dom';
import { useHomeFaqs } from '../../hooks';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const FaqSkeleton = () => (
	<div className='flex flex-col gap-3'>
		{Array.from({ length: 4 }).map((_, index) => (
			<Skeleton key={index} className='h-14 rounded-xl' />
		))}
	</div>
);

export const FaqSection = () => {
	const { faqs, isLoading, isError, refetch } = useHomeFaqs();

	return (
		<section className='container flex flex-col gap-4'>
			<div className='flex items-end justify-between gap-4'>
				<SectionHeading title='Preguntas frecuentes' />
				<Link
					to='/preguntas-frecuentes'
					className='focus-ring shrink-0 text-sm font-semibold text-primary-700 hover:text-primary-800'
				>
					Ver todas
				</Link>
			</div>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={faqs.length === 0}
				onRetry={refetch}
				loadingFallback={<FaqSkeleton />}
				emptyTitle='No pudimos cargar las preguntas frecuentes'
			>
				<div className='flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white'>
					{faqs.map(faq => (
						<details key={faq.id} className='group p-5'>
							<summary className='cursor-pointer list-none text-sm font-semibold text-neutral-900 marker:content-none'>
								{faq.question}
							</summary>
							<p className='mt-2 text-sm text-neutral-600'>{faq.answer}</p>
						</details>
					))}
				</div>
			</SectionState>
		</section>
	);
};
