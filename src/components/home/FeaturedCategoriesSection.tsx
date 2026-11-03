import { Link } from 'react-router-dom';
import { useFeaturedCategories } from '../../hooks';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

// La sección se muestra dentro de una capa del alto de la pantalla
// (ScrollZoomStage), así que la altura de las tarjetas depende del alto del
// viewport: con 2 columnas hay 4 filas y con 4 columnas (lg) hay 2. El resto
// que se descuenta es el encabezado, los huecos y el padding de la capa.
const CARD_HEIGHT =
	'h-[clamp(5rem,calc((100svh-18rem)/4),9rem)] lg:h-[clamp(10rem,calc((100svh-16rem)/2),14rem)]';

const CategoriesSkeleton = () => (
	<div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
		{Array.from({ length: 4 }).map((_, index) => (
			<Skeleton key={index} className={`${CARD_HEIGHT} rounded-2xl`} />
		))}
	</div>
);

export const FeaturedCategoriesSection = () => {
	const { categories, isLoading, isError, refetch } = useFeaturedCategories();

	return (
		<section className='container flex flex-col gap-4'>
			<SectionHeading
				title='Categorías destacadas'
				description='Explora por tipo de producto; la disponibilidad exacta depende del stock y de la zona de entrega.'
			/>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={categories.length === 0}
				onRetry={refetch}
				loadingFallback={<CategoriesSkeleton />}
				emptyTitle='Aún no hay categorías disponibles'
				emptyDescription='Vuelve a intentarlo en unos minutos.'
			>
				<div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
					{categories.map(category => (
						<Link
							key={category.id}
							to={`/categoria/${category.slug}`}
							className={`focus-ring group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-neutral-200 card-hover-lift ${CARD_HEIGHT}`}
						>
							{/* Decorativa: el nombre de la categoría ya está en el texto */}
							<img
								src={category.imageUrl}
								alt=''
								aria-hidden='true'
								decoding='async'
								className='absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 motion-reduce:transition-none'
							/>
							{/* Degradado para que el texto blanco mantenga contraste sobre la foto */}
							<div
								aria-hidden='true'
								className='absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent'
							/>

							<div className='flex flex-col gap-0.5 p-3 sm:p-4'>
								<p className='text-sm font-semibold leading-tight text-white sm:text-base'>
									{category.label}
								</p>
								<p className='text-xs text-white/85 sm:text-sm'>
									{category.productCount} productos
								</p>
							</div>
						</Link>
					))}
				</div>
			</SectionState>
		</section>
	);
};
