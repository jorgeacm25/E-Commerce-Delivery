import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../../hooks';
import { ProductCard } from '../ui/ProductCard';
import { Reveal } from '../ui/Reveal';
import { Skeleton } from '../ui/Skeleton';
import { SectionHeading } from './SectionHeading';
import { SectionState } from './SectionState';

// Retraso entre tarjetas de una misma fila al entrar con el scroll. Se
// escalona por columna (hasta 4 en lg) para que cada fila entre en cascada
// sin que las últimas tarjetas esperen demasiado.
const CARD_STAGGER_MS = 80;
const MAX_COLUMNS = 4;

const ProductsSkeleton = () => (
	<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
		{Array.from({ length: 8 }).map((_, index) => (
			<Skeleton key={index} className='h-64 rounded-2xl' />
		))}
	</div>
);

// Muestra de productos de varias categorías (datos de prueba, ver
// featuredProductsMock). Cada tarjeta lleva a su categoría y aparece con
// <Reveal/> al entrar en pantalla, igual que el resto de secciones.
export const FeaturedProductsSection = () => {
	const { products, isLoading, isError, refetch } = useFeaturedProducts();

	return (
		<section className='container flex flex-col gap-4'>
			<div className='flex items-end justify-between gap-4'>
				<SectionHeading
					title='Productos destacados'
					description='Una selección de cárnicos, bebidas, despensa y aseo para armar el pedido de tu familia.'
				/>
				<Link
					to='/catalogo'
					className='focus-ring shrink-0 text-sm font-semibold text-primary-700 hover:text-primary-800'
				>
					Ver catálogo
				</Link>
			</div>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={products.length === 0}
				onRetry={refetch}
				loadingFallback={<ProductsSkeleton />}
				emptyTitle='No hay productos destacados por ahora'
				emptyDescription='Vuelve a intentarlo en unos minutos.'
			>
				<ul className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
					{products.map((product, index) => (
						<li key={product.id}>
							<Reveal delay={(index % MAX_COLUMNS) * CARD_STAGGER_MS} className='h-full'>
								<Link
									to={`/categoria/${product.categorySlug}`}
									className='focus-ring block h-full rounded-2xl'
								>
									<ProductCard
										image={product.imageUrl}
										name={product.name}
										price={product.priceUsd}
										inStock={product.inStock}
										category={product.categoryLabel}
										imageFit='cover'
										className='h-full'
									/>
								</Link>
							</Reveal>
						</li>
					))}
				</ul>
			</SectionState>
		</section>
	);
};
