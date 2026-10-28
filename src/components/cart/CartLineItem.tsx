import { FiTrash2 } from 'react-icons/fi';
import { ICartItem } from '../shared/CartItem';
import { AddItemResult, useCartStore } from '../../store/cart.store';
import { Badge, CurrencyDisplay, IconButton, QuantitySelector } from '../ui';

interface Props {
	item: ICartItem;
	onStockError?: (result: Extract<AddItemResult, { ok: false }>) => void;
}

// Línea individual del carrito (CartDrawer). A diferencia del componente
// legacy src/components/shared/CartItem.tsx (no enlazado desde el router
// nuevo), este usa el sistema de diseño (`src/components/ui`) para quedar
// consistente con el resto del catálogo/ficha de producto ya migrados.
export const CartLineItem = ({ item, onStockError }: Props) => {
	const updateQuantity = useCartStore(state => state.updateQuantity);
	const removeItem = useCartStore(state => state.removeItem);

	const handleQuantityChange = (quantity: number) => {
		const result = updateQuantity(item.variantId, quantity, item.comboId);

		if (!result.ok) {
			onStockError?.(result);
		}
	};

	const lineTotal = item.price * item.quantity;

	return (
		<li className='flex gap-4 rounded-xl border border-white/60 bg-white/95 p-4 text-neutral-900 shadow-card'>
			<img
				src={item.image}
				alt={item.name}
				className='h-20 w-20 shrink-0 rounded-lg object-contain'
			/>

			<div className='flex flex-1 flex-col gap-2'>
				<div className='flex items-start justify-between gap-3'>
					<div>
						<p className='font-semibold text-neutral-900'>{item.name}</p>
						<p className='text-sm text-neutral-500'>{item.variantLabel}</p>
						{item.comboName && (
							<Badge variant='secondary' className='mt-1'>
								Combo: {item.comboName}
							</Badge>
						)}
					</div>

					<IconButton
						icon={<FiTrash2 />}
						label={`Eliminar ${item.name} del carrito`}
						variant='ghost'
						size='sm'
						onClick={() => removeItem(item.variantId, item.comboId)}
					/>
				</div>

				<div className='flex flex-wrap items-center justify-between gap-3'>
					<QuantitySelector quantity={item.quantity} onChange={handleQuantityChange} min={1} />
					<CurrencyDisplay usd={lineTotal} />
				</div>
			</div>
		</li>
	);
};
