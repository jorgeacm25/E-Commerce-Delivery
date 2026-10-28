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
	onAdd,
	className,
}: Props) => {
	const imageRef = useRef<HTMLImageElement>(null);
	const hasDiscount = discountPriceUsd !== undefined && discountPriceUsd < price;

	return (
		<div
			className={cn(
				'group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition-shadow hover:shadow-popover',
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

			<div className='flex h-40 items-center justify-center bg-neutral-50 p-4'>
				<img ref={imageRef} src={image} alt={name} className='h-full w-full object-contain' />
			</div>

			<div className='flex flex-1 flex-col gap-2 p-4'>
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
