import { Link } from 'react-router-dom';
import { cn } from '../../helpers';
import { buildCartItem } from '../../helpers/catalog';
import { CatalogProduct } from '../../interfaces';
import { useCartStore } from '../../store/cart.store';
import { ProductCard } from '../ui/ProductCard';

interface Props {
	products: CatalogProduct[];
	className?: string;
}

export const ProductGrid = ({ products, className }: Props) => {
	const addItem = useCartStore(state => state.addItem);

	return (
		<div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}>
			{products.map(product => (
				<Link key={product.id} to={`/producto/${product.slug}`}>
					<ProductCard
						image={product.images[0]}
						name={product.name}
						price={product.priceUsd}
						inStock={product.availability !== 'out_of_stock'}
						onAdd={() => addItem(buildCartItem(product))}
					/>
				</Link>
			))}
		</div>
	);
};
