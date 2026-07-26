import { StateCreator, create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ICartItem } from '../components/shared/CartItem';
import { ComboWithItems } from '../interfaces';

// Dos ítems son "el mismo renglón" del carrito solo si coinciden variantId
// Y el origen del combo (undefined === undefined cuenta como igual).
// Así, la misma variante puede estar suelta en el carrito y también
// formar parte de un combo, sin mezclarse entre sí.
const isSameLine = (a: ICartItem, b: { variantId: string; comboId?: string }) =>
	a.variantId === b.variantId && (a.comboId ?? null) === (b.comboId ?? null);

export interface CartState {
	items: ICartItem[];
	totalItemsInCart: number;
	totalAmount: number;

	addItem: (item: ICartItem) => void;
	addCombo: (combo: ComboWithItems, quantity?: number) => void;
	removeItem: (variantId: string, comboId?: string) => void;
	updateQuantity: (
		variantId: string,
		quantity: number,
		comboId?: string
	) => void;
	cleanCart: () => void;
}

const recalculate = (items: ICartItem[]) => ({
	totalItemsInCart: items.reduce((acc, i) => acc + i.quantity, 0),
	totalAmount: items.reduce((acc, i) => acc + i.price * i.quantity, 0),
});

const storeApi: StateCreator<CartState> = (set, get) => ({
	items: [],

	totalItemsInCart: 0,
	totalAmount: 0,

	addItem: item => {
		set(state => {
			const existingItemIndex = state.items.findIndex(i =>
				isSameLine(i, item)
			);
			let updatedItems;

			if (existingItemIndex >= 0) {
				// Si el item ya existe en el carrito, actualizamos la cantidad
				updatedItems = state.items.map((i, index) =>
					index === existingItemIndex
						? {
								...i,
								quantity: i.quantity + item.quantity,
						  }
						: i
				);
			} else {
				// Si el item no existe en el carrito, lo añadimos
				updatedItems = [...state.items, item];
			}

			return { items: updatedItems, ...recalculate(updatedItems) };
		});
	},

	// Expande un combo en sus variantes, con el precio del combo repartido
	// proporcionalmente entre ellas (así la suma del carrito da exactamente
	// el precio del combo, no la suma de precios individuales).
	addCombo: (combo, quantity = 1) => {
		const totalNormal = combo.combo_items.reduce(
			(acc, item) =>
				acc + (item.variants?.price ?? 0) * item.cantidad,
			0
		);

		const newItems: ICartItem[] = combo.combo_items
			.filter(item => item.variants)
			.map(item => {
				const variant = item.variants!;
				const cantidadTotal = item.cantidad * quantity;

				const shareOfTotal =
					totalNormal > 0
						? (variant.price * item.cantidad) / totalNormal
						: 1 / combo.combo_items.length;

				const allocatedTotal =
					combo.precio_combo_usd * shareOfTotal * quantity;

				return {
					variantId: variant.id,
					productId: variant.products?.name ?? '',
					name: variant.products?.name ?? combo.nombre,
					color: variant.color_name,
					storage: variant.storage,
					image: variant.products?.images?.[0] ?? '',
					price: allocatedTotal / cantidadTotal,
					quantity: cantidadTotal,
					comboId: combo.id,
					comboName: combo.nombre,
				};
			});

		const state = get();

		// Si el combo ya está en el carrito, sumamos cantidades por renglón
		const updatedItems = [...state.items];

		for (const newItem of newItems) {
			const existingIndex = updatedItems.findIndex(i =>
				isSameLine(i, newItem)
			);

			if (existingIndex >= 0) {
				updatedItems[existingIndex] = {
					...updatedItems[existingIndex],
					quantity:
						updatedItems[existingIndex].quantity +
						newItem.quantity,
				};
			} else {
				updatedItems.push(newItem);
			}
		}

		set({ items: updatedItems, ...recalculate(updatedItems) });
	},

	removeItem: (variantId, comboId) => {
		set(state => {
			const updatedItems = state.items.filter(
				i => !isSameLine(i, { variantId, comboId })
			);

			return { items: updatedItems, ...recalculate(updatedItems) };
		});
	},

	updateQuantity: (variantId, quantity, comboId) => {
		set(state => {
			const updatedItems = state.items.map(i =>
				isSameLine(i, { variantId, comboId })
					? { ...i, quantity }
					: i
			);

			return { items: updatedItems, ...recalculate(updatedItems) };
		});
	},

	cleanCart: () => {
		set({ items: [], totalItemsInCart: 0, totalAmount: 0 });
	},
});

export const useCartStore = create<CartState>()(
	devtools(
		persist(storeApi, {
			name: 'cart-store',
		})
	)
);
