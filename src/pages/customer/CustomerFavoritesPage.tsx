import { useQueries } from '@tanstack/react-query';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { EmptyState, ProductCard, Skeleton } from '../../components/ui';
import { useAuth, useFavorites, useToggleFavorite } from '../../hooks';
import { getCatalogProductBySlug } from '../../services/catalog.service';

export const CustomerFavoritesPage = () => {
	const { user } = useAuth();
	const { favorites, isLoading: isLoadingFavorites } = useFavorites(user?.id);
	const { remove } = useToggleFavorite(user?.id);

	const productQueries = useQueries({
		queries: favorites.map(favorite => ({
			queryKey: ['catalog', 'product', favorite.productId],
			queryFn: () => getCatalogProductBySlug(favorite.productId),
			enabled: !isLoadingFavorites,
		})),
	});

	const isLoading = isLoadingFavorites || productQueries.some(query => query.isLoading);
	const products = productQueries.map(query => query.data).filter((product): product is NonNullable<typeof product> => Boolean(product));

	if (isLoading) {
		return (
			<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className='h-64' />
				))}
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<EmptyState
				icon={<FiHeart />}
				title='No tienes productos favoritos'
				description='Marca productos como favoritos desde su página para encontrarlos más rápido.'
				action={
					<Link to='/catalogo' className='focus-ring text-sm font-semibold text-primary-700 hover:underline'>
						Ir al catálogo
					</Link>
				}
			/>
		);
	}

	return (
		<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
			{products.map(product => (
				<div key={product.slug} className='relative'>
					<button
						type='button'
						onClick={() => remove(product.slug)}
						aria-label='Quitar de favoritos'
						className='focus-ring absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-danger-500 shadow-card'
					>
						<FiHeart className='fill-current' aria-hidden='true' />
					</button>
					<Link to={`/producto/${product.slug}`}>
						<ProductCard
							image={product.images[0]}
							name={product.name}
							price={product.priceUsd}
							inStock={product.availability !== 'out_of_stock'}
						/>
					</Link>
				</div>
			))}
		</div>
	);
};
