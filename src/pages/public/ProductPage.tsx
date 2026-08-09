import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiShoppingCart } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { ComboContents } from '../../components/product/ComboContents';
import { FavoriteButton } from '../../components/product/FavoriteButton';
import { ProductDeliveryZones } from '../../components/product/ProductDeliveryZones';
import { ProductGallery } from '../../components/product/ProductGallery';
import { RelatedProducts } from '../../components/product/RelatedProducts';
import { VariantSelector } from '../../components/product/VariantSelector';
import {
	Badge,
	Button,
	CurrencyDisplay,
	EmptyState,
	PageHeader,
	QuantitySelector,
	Skeleton,
} from '../../components/ui';
import { availabilityLabel, buildCartItem } from '../../helpers/catalog';
import { useCatalogProduct } from '../../hooks';
import { useCartStore } from '../../store/cart.store';

const ProductSkeleton = () => (
	<div className='grid gap-8 lg:grid-cols-2'>
		<Skeleton className='aspect-square rounded-2xl' />
		<div className='flex flex-col gap-4'>
			<Skeleton variant='text' className='h-8 w-2/3' />
			<Skeleton variant='text' className='h-4 w-full' />
			<Skeleton variant='text' className='h-4 w-1/2' />
			<Skeleton className='h-10 w-40 rounded-lg' />
		</div>
	</div>
);

export const ProductPage = () => {
	const { slug } = useParams<{ slug: string }>();
	const { product, isLoading, isError, refetch } = useCatalogProduct(slug);
	const addItem = useCartStore(state => state.addItem);

	const [selectedVariantId, setSelectedVariantId] = useState('');
	const [quantity, setQuantity] = useState(1);

	useEffect(() => {
		if (product && product.variants.length > 0) {
			setSelectedVariantId(product.variants[0].id);
		}
	}, [product]);

	if (isLoading) {
		return (
			<div className='container flex flex-col gap-8 py-8'>
				<ProductSkeleton />
			</div>
		);
	}

	if (isError) {
		return (
			<div className='container flex flex-col gap-8 py-8'>
				<EmptyState
					title='No pudimos cargar el producto'
					description='Ocurrió un error inesperado. Inténtalo de nuevo.'
					action={<Button onClick={() => refetch()}>Reintentar</Button>}
				/>
			</div>
		);
	}

	if (!product) {
		return (
			<div className='container flex flex-col gap-8 py-8'>
				<PageHeader
					title='Producto no encontrado'
					breadcrumb={[
						{ label: 'Inicio', href: '/' },
						{ label: 'Catálogo', href: '/catalogo' },
						{ label: slug ?? 'Producto' },
					]}
				/>
				<EmptyState
					title='Este producto ya no está disponible'
					description='Puede que se haya agotado o que el enlace sea incorrecto.'
					action={
						<Link
							to='/catalogo'
							className='focus-ring text-sm font-semibold text-primary-700 hover:underline'
						>
							Ir al catálogo
						</Link>
					}
				/>
			</div>
		);
	}

	const selectedVariant = product.variants.find(variant => variant.id === selectedVariantId);
	const displayPrice = selectedVariant?.priceUsd ?? product.priceUsd;
	// El descuento es del producto/combo, no de una variante puntual — no
	// aplica si hay una variante con su propio precio seleccionada.
	const displayDiscountedPrice = selectedVariant ? undefined : product.discountPriceUsd;
	const displayStock = selectedVariant?.stock ?? product.stock;
	const { label: availabilityText, badgeVariant } = availabilityLabel(product.availability);
	const inStock = product.availability !== 'out_of_stock' && displayStock > 0;

	const handleAddToCart = () => {
		const result = addItem(buildCartItem(product, quantity, selectedVariant), displayStock);

		if (!result.ok) {
			toast.error(
				result.reason === 'OUT_OF_STOCK'
					? 'Ese producto ya no tiene unidades disponibles.'
					: `Solo quedan ${result.availableStock} unidad(es) disponibles.`,
				{ position: 'bottom-right' }
			);
			return;
		}

		toast.success('Producto añadido al carrito', { position: 'bottom-right' });
	};

	return (
		<div className='container flex flex-col gap-10 py-8'>
			<PageHeader
				title={product.name}
				breadcrumb={[
					{ label: 'Inicio', href: '/' },
					{ label: 'Catálogo', href: '/catalogo' },
					{ label: product.categoryName, href: `/categoria/${product.categorySlug}` },
					{ label: product.name },
				]}
				actions={<FavoriteButton productId={product.slug} />}
			/>

			<div className='grid gap-8 lg:grid-cols-2'>
				<ProductGallery images={product.images} alt={product.name} />

				<div className='flex flex-col gap-5'>
					<div>
						<Badge variant={badgeVariant}>{availabilityText}</Badge>
						<p className='mt-2 text-sm text-neutral-500'>{product.weightOrUnitLabel}</p>
					</div>

					<CurrencyDisplay usd={displayPrice} discountedUsd={displayDiscountedPrice} size='lg' />

					<p className='text-sm text-neutral-600'>{product.description}</p>

					{product.variants.length > 0 && (
						<VariantSelector
							variants={product.variants}
							selectedVariantId={selectedVariantId}
							onSelect={variant => setSelectedVariantId(variant.id)}
						/>
					)}

					{product.isCombo && product.comboItems && (
						<ComboContents items={product.comboItems} />
					)}

					<ProductDeliveryZones zoneIds={product.deliveryZoneIds} />

					<div className='flex flex-wrap items-center gap-4'>
						<QuantitySelector quantity={quantity} onChange={setQuantity} min={1} max={displayStock} />

						<Button onClick={handleAddToCart} disabled={!inStock} leftIcon={<FiShoppingCart />}>
							Agregar al carrito
						</Button>
					</div>
				</div>
			</div>

			<RelatedProducts slug={product.slug} />
		</div>
	);
};
