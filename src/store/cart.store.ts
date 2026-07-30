import Decimal from 'decimal.js';
import { StateCreator, create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { ICartItem } from '../components/shared/CartItem';
import { ApplyCouponResult, calculateDiscount, findCoupon } from '../helpers/coupon';
import { CartCoupon, ComboWithItems } from '../interfaces';

// Dos ítems son "el mismo renglón" del carrito solo si coinciden variantId
// Y el origen del combo (undefined === undefined cuenta como igual).
// Así, la misma variante puede estar suelta en el carrito y también
// formar parte de un combo a la vez, sin mezclarse entre sí. Esta misma
// comparación es la que previene líneas duplicadas para la misma variante.
const isSameLine = (a: ICartItem, b: { variantId: string; comboId?: string }) =>
	a.variantId === b.variantId && (a.comboId ?? null) === (b.comboId ?? null);

export type AddItemResult =
	| { ok: true }
	| { ok: false; reason: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK'; availableStock: number };

export type { ApplyCouponResult } from '../helpers/coupon';

// NOTA sobre los precios: `ICartItem.price` es una copia del precio mostrado
// en el catálogo simulado en el momento en que se agregó al carrito. Todo lo
// derivado de aquí (subtotal, discount, total) es una estimación *provisional*
// del lado del cliente para que la UI pueda mostrar un total mientras compra.
// El total definitivo (y la validación de que el precio no cambió) debe
// recalcularse en el servidor (Supabase) al confirmar el checkout, igual que
// ya ocurre con el stock en `createOrder` (src/actions/order.ts). Por eso los
// totales se exponen desglosados (subtotal/discount/deliveryCost/total) en
// vez de como un único número: así el recálculo del servidor puede sustituir
// cualquiera de las partes sin perder de dónde salió cada una.
export interface CartState {
	items: ICartItem[];
	coupon: CartCoupon | null;
	deliveryCost: number;
	// true una vez que zustand terminó de leer/fusionar el carrito persistido
	// en localStorage. Permite a la UI evitar un parpadeo de "carrito vacío"
	// mientras se hidrata.
	hasHydrated: boolean;

	totalItemsInCart: number;
	// Alias de `subtotal` que se conserva por compatibilidad con
	// consumidores existentes (p. ej. ItemsCheckout, código legacy sin
	// enlazar desde el router).
	totalAmount: number;
	subtotal: number;
	discount: number;
	total: number;

	addItem: (item: ICartItem, availableStock?: number) => AddItemResult;
	addCombo: (combo: ComboWithItems, quantity?: number) => void;
	removeItem: (variantId: string, comboId?: string) => void;
	updateQuantity: (
		variantId: string,
		quantity: number,
		comboId?: string,
		availableStock?: number
	) => AddItemResult;
	cleanCart: () => void;
	setDeliveryCost: (cost: number) => void;
	applyCoupon: (code: string) => ApplyCouponResult;
	removeCoupon: () => void;
	setHasHydrated: (value: boolean) => void;
}

// Suma price*quantity con decimal.js (no float encadenado) porque este
// cálculo se repite en cada mutación del carrito y sobre un número variable
// de líneas; ver la regla de dinero en CLAUDE.md.
const calculateSubtotal = (items: ICartItem[]) =>
	items
		.reduce((acc, item) => acc.plus(new Decimal(item.price).times(item.quantity)), new Decimal(0))
		.toDecimalPlaces(2)
		.toNumber();

const recalculate = (items: ICartItem[], coupon: CartCoupon | null, deliveryCost: number) => {
	const totalItemsInCart = items.reduce((acc, item) => acc + item.quantity, 0);
	const subtotal = calculateSubtotal(items);
	const discount = calculateDiscount(subtotal, coupon);
	const total = new Decimal(subtotal).minus(discount).plus(deliveryCost).toDecimalPlaces(2).toNumber();

	return { totalItemsInCart, totalAmount: subtotal, subtotal, discount, total };
};

const storeApi: StateCreator<CartState> = (set, get) => ({
	items: [],
	coupon: null,
	deliveryCost: 0,
	hasHydrated: false,

	totalItemsInCart: 0,
	totalAmount: 0,
	subtotal: 0,
	discount: 0,
	total: 0,

	addItem: (item, availableStock) => {
		const state = get();
		const existingItem = state.items.find(i => isSameLine(i, item));
		const nextQuantity = (existingItem?.quantity ?? 0) + item.quantity;

		if (availableStock !== undefined) {
			if (availableStock <= 0) {
				return { ok: false, reason: 'OUT_OF_STOCK', availableStock };
			}

			if (nextQuantity > availableStock) {
				return { ok: false, reason: 'INSUFFICIENT_STOCK', availableStock };
			}
		}

		set(state => {
			const existingItemIndex = state.items.findIndex(i => isSameLine(i, item));

			const updatedItems =
				existingItemIndex >= 0
					? state.items.map((i, index) =>
							index === existingItemIndex ? { ...i, quantity: nextQuantity } : i
					  )
					: [...state.items, item];

			return { items: updatedItems, ...recalculate(updatedItems, state.coupon, state.deliveryCost) };
		});

		return { ok: true };
	},

	// Expande un combo en sus variantes, con el precio del combo repartido
	// proporcionalmente entre ellas (así la suma del carrito da exactamente
	// el precio del combo, no la suma de precios individuales).
	addCombo: (combo, quantity = 1) => {
		const totalNormal = combo.combo_items.reduce(
			(acc, item) => acc + (item.variants?.price ?? 0) * item.cantidad,
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

				const allocatedTotal = combo.precio_combo_usd * shareOfTotal * quantity;

				return {
					variantId: variant.id,
					productId: variant.products?.name ?? '',
					name: variant.products?.name ?? combo.nombre,
					variantLabel: [variant.storage, variant.color_name].filter(Boolean).join(' / '),
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
			const existingIndex = updatedItems.findIndex(i => isSameLine(i, newItem));

			if (existingIndex >= 0) {
				updatedItems[existingIndex] = {
					...updatedItems[existingIndex],
					quantity: updatedItems[existingIndex].quantity + newItem.quantity,
				};
			} else {
				updatedItems.push(newItem);
			}
		}

		set({ items: updatedItems, ...recalculate(updatedItems, state.coupon, state.deliveryCost) });
	},

	removeItem: (variantId, comboId) => {
		set(state => {
			const updatedItems = state.items.filter(i => !isSameLine(i, { variantId, comboId }));

			return { items: updatedItems, ...recalculate(updatedItems, state.coupon, state.deliveryCost) };
		});
	},

	updateQuantity: (variantId, quantity, comboId, availableStock) => {
		if (quantity < 1) {
			return { ok: true };
		}

		if (availableStock !== undefined) {
			if (availableStock <= 0) {
				return { ok: false, reason: 'OUT_OF_STOCK', availableStock };
			}

			if (quantity > availableStock) {
				return { ok: false, reason: 'INSUFFICIENT_STOCK', availableStock };
			}
		}

		set(state => {
			const updatedItems = state.items.map(i =>
				isSameLine(i, { variantId, comboId }) ? { ...i, quantity } : i
			);

			return { items: updatedItems, ...recalculate(updatedItems, state.coupon, state.deliveryCost) };
		});

		return { ok: true };
	},

	cleanCart: () => {
		set({
			items: [],
			coupon: null,
			deliveryCost: 0,
			...recalculate([], null, 0),
		});
	},

	setDeliveryCost: cost => {
		set(state => ({
			deliveryCost: cost,
			...recalculate(state.items, state.coupon, cost),
		}));
	},

	applyCoupon: code => {
		const state = get();
		const result = findCoupon(code, state.subtotal);

		if (!result.ok) {
			return result;
		}

		set(state => ({
			coupon: result.coupon,
			...recalculate(state.items, result.coupon, state.deliveryCost),
		}));

		return result;
	},

	removeCoupon: () => {
		set(state => ({
			coupon: null,
			...recalculate(state.items, null, state.deliveryCost),
		}));
	},

	setHasHydrated: value => set({ hasHydrated: value }),
});

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

const isValidCartItem = (value: unknown): value is ICartItem => {
	if (!value || typeof value !== 'object') return false;
	const item = value as Record<string, unknown>;

	return (
		typeof item.variantId === 'string' &&
		typeof item.productId === 'string' &&
		typeof item.name === 'string' &&
		typeof item.variantLabel === 'string' &&
		isFiniteNumber(item.price) &&
		item.price >= 0 &&
		isFiniteNumber(item.quantity) &&
		item.quantity > 0 &&
		typeof item.image === 'string' &&
		(item.comboId === undefined || typeof item.comboId === 'string') &&
		(item.comboName === undefined || typeof item.comboName === 'string')
	);
};

const isValidCoupon = (value: unknown): value is CartCoupon => {
	if (!value || typeof value !== 'object') return false;
	const coupon = value as Record<string, unknown>;

	return (
		typeof coupon.code === 'string' &&
		(coupon.type === 'percentage' || coupon.type === 'fixed') &&
		isFiniteNumber(coupon.value) &&
		typeof coupon.description === 'string'
	);
};

// El carrito persistido en localStorage puede llegar corrupto o manipulado
// (formato inesperado, versión previa incompatible, edición manual). En vez
// de dejar que un valor inválido rompa el store o el cálculo de totales, se
// sanea cada campo al fusionar el estado persistido y se descarta lo que no
// tenga la forma esperada.
const sanitizePersistedState = (persisted: unknown) => {
	const state = (persisted ?? {}) as Partial<CartState>;

	const items = Array.isArray(state.items) ? state.items.filter(isValidCartItem) : [];
	const coupon = isValidCoupon(state.coupon) ? state.coupon : null;
	const deliveryCost = isFiniteNumber(state.deliveryCost) && state.deliveryCost >= 0 ? state.deliveryCost : 0;

	return { items, coupon, deliveryCost };
};

export const useCartStore = create<CartState>()(
	devtools(
		persist(storeApi, {
			name: 'cart-store',
			version: 1,
			storage: createJSONStorage(() => localStorage),
			// Solo se persiste la selección del cliente (líneas, cupón, costo
			// de entrega). Los totales derivados se recalculan al hidratar en
			// vez de confiar en el valor guardado.
			partialize: state => ({
				items: state.items,
				coupon: state.coupon,
				deliveryCost: state.deliveryCost,
			}),
			merge: (persisted, currentState) => {
				const { items, coupon, deliveryCost } = sanitizePersistedState(persisted);

				return {
					...currentState,
					items,
					coupon,
					deliveryCost,
					...recalculate(items, coupon, deliveryCost),
				};
			},
			onRehydrateStorage: () => state => {
				state?.setHasHydrated(true);
			},
		})
	)
);
