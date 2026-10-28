import { FiStar } from 'react-icons/fi';
import { useTestimonials } from '../../hooks';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

const TestimonialsSkeleton = () => (
	<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
		{Array.from({ length: 3 }).map((_, index) => (
			<Skeleton key={index} className='h-40 rounded-2xl' />
		))}
	</div>
);

export const TestimonialsSection = () => {
	const { testimonials, isLoading, isError, refetch } = useTestimonials();

	return (
		<section className='container flex flex-col gap-4'>
			<SectionHeading
				title='Lo que dicen nuestros compradores'
				description='Testimonios de personas que compraron desde el exterior para su familia en Cuba.'
			/>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={testimonials.length === 0}
				onRetry={refetch}
				loadingFallback={<TestimonialsSkeleton />}
				emptyTitle='Aún no hay testimonios para mostrar'
			>
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
					{testimonials.map(testimonial => (
						<figure
							key={testimonial.id}
							className='flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card card-hover'
						>
							<div className='flex gap-0.5 text-warning-500'>
								{Array.from({ length: testimonial.rating }).map((_, index) => (
									<FiStar key={index} aria-hidden='true' className='fill-current' />
								))}
							</div>
							<blockquote className='text-sm italic text-neutral-700'>
								“{testimonial.quote}”
							</blockquote>
							<figcaption className='text-xs font-medium text-neutral-500'>
								{testimonial.buyerName}, compró desde {testimonial.buyerCountry} para
								su familia en {testimonial.recipientCity}
							</figcaption>
						</figure>
					))}
				</div>
			</SectionState>
		</section>
	);
};
