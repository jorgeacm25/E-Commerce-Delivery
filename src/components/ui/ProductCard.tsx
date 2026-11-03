import { useRef } from 'react';
import { FiPlus } from 'react-icons/fi';
import { cn } from '../../helpers';
import { Badge } from './Badge';
import { CurrencyDisplay } from './CurrencyDisplay';

interface Props {
	image: string;
	name: string;
	price: number;
	discountPriceUsd?: number;
	inStock?: boolean;
	/** Etiqueta pequeña sobre el nombre (p. ej. la categoría). */
	category?: string;
	/**
	 * `contain` (por defecto): la imagen entera con margen, para fotos de
	 * producto recortado. `cover`: la foto llena la cabecera de la tarjeta.
	 */
	imageFit?: 'contain' | 'cover';
	// Recibe la imagen de la tarjeta para animar su vuelo hasta el carrito
	onAdd?: (source: HTMLElement | null) => void;
	className?: string;
}

export const ProductCard = ({
	image,
	name,
	price,
	discountPriceUsd,
	inStock = true,
	category,
	imageFit = 'contain',
	onAdd,
	className,
}: Props) => {
	const imageRef = useRef<HTMLImageElement>(null);
	const hasDiscount = discountPriceUsd !== undefined && discountPriceUsd < price;

	return (
		<div
			className={cn(
				'group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card card-hover',
				className
			)}
		>
			{!inStock ? (
				<Badge variant='danger' className='absolute left-3 top-3 z-10'>
					Agotado
				</Badge>
			) : (
				hasDiscount && (
					<Badge variant='success' className='absolute left-3 top-3 z-10'>
						Oferta
					</Badge>
				)
			)}

			<div
				className={cn(
					'flex h-40 items-center justify-center overflow-hidden bg-neutral-50',
					imageFit === 'contain' && 'p-4'
				)}
			>
				<img
					ref={imageRef}
					src={image}
					alt={name}
					loading='lazy'
					decoding='async'
					className={cn(
						'h-full w-full',
						imageFit === 'cover'
							? 'object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none'
							: 'object-contain'
					)}
				/>
			</div>

			<div className='flex flex-1 flex-col gap-2 p-4'>
				{category && (
					<p className='text-xs font-semibold uppercase tracking-wide text-secondary-600'>
						{category}
					</p>
				)}
				<p className='line-clamp-2 text-sm font-medium text-neutral-800'>{name}</p>

				<div className='mt-auto flex items-end justify-between gap-2'>
					<CurrencyDisplay usd={price} discountedUsd={discountPriceUsd} size='sm' />

					{onAdd && (
						<button
							type='button'
							onClick={event => {
								// Evita que el click navegue cuando la tarjeta está dentro de un <Link>.
								event.preventDefault();
								event.stopPropagation();
								onAdd(imageRef.current);
							}}
							disabled={!inStock}
							aria-label={`Añadir ${name} al carrito`}
							className='focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-300'
						>
							<FiPlus />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
