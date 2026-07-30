import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { availabilityLabel, buildCartItem } from '../../helpers/catalog';
import { CatalogProduct } from '../../interfaces';
import { useCartStore } from '../../store/cart.store';
import { Badge } from '../ui/Badge';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface Props {
	products: CatalogProduct[];
	className?: string;
}

export const ProductListRow = ({ products, className }: Props) => {
	const addItem = useCartStore(state => state.addItem);

	return (
		<ul className={className}>
			{products.map(product => {
				const inStock = product.availability !== 'out_of_stock';
				const { label, badgeVariant } = availabilityLabel(product.availability);

				return (
					<li
						key={product.id}
						className='flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-card'
					>
						<Link to={`/producto/${product.slug}`} className='shrink-0'>
							<img
								src={product.images[0]}
								alt={product.name}
								className='h-20 w-20 rounded-xl object-contain'
							/>
						</Link>

						<div className='min-w-0 flex-1'>
							<Link
								to={`/producto/${product.slug}`}
								className='focus-ring line-clamp-1 font-medium text-neutral-900 hover:text-primary-700'
							>
								{product.name}
							</Link>
							<p className='line-clamp-1 text-sm text-neutral-500'>{product.description}</p>
							<Badge variant={badgeVariant} className='mt-1'>
								{label}
							</Badge>
						</div>

						<div className='flex shrink-0 flex-col items-end gap-2'>
							<CurrencyDisplay usd={product.priceUsd} size='sm' />
							<button
								type='button'
								disabled={!inStock}
								onClick={() => addItem(buildCartItem(product))}
								aria-label={`Añadir ${product.name} al carrito`}
								className='focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-300'
							>
								<FiPlus />
							</button>
						</div>
					</li>
				);
			})}
		</ul>
	);
};
