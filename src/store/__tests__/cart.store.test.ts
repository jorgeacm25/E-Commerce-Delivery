import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ICartItem } from '../../components/shared/CartItem';
import { ComboWithItems } from '../../interfaces';
import { useCartStore } from '../cart.store';

const baseItem = (overrides: Partial<ICartItem> = {}): ICartItem => ({
	variantId: 'arroz-5lb',
	productId: 'arroz',
	name: 'Arroz',
	variantLabel: '5 lb',
	price: 5.9,
	quantity: 1,
	image: '/arroz.jpg',
	...overrides,
});

const resetStore = () => {
	localStorage.clear();
	useCartStore.setState({
		items: [],
		coupon: null,
		deliveryCost: 0,
		hasHydrated: true,
		totalItemsInCart: 0,
		totalAmount: 0,
		subtotal: 0,
		discount: 0,
		total: 0,
	});
};

describe('useCartStore', () => {
	beforeEach(() => {
		resetStore();
	});

	describe('addItem', () => {
		it('agrega un producto nuevo y recalcula los totales', () => {
			const result = useCartStore.getState().addItem(baseItem({ quantity: 2 }));

			expect(result).toEqual({ ok: true });

			const state = useCartStore.getState();
			expect(state.items).toHaveLength(1);
			expect(state.totalItemsInCart).toBe(2);
			expect(state.subtotal).toBeCloseTo(11.8);
			expect(state.total).toBeCloseTo(11.8);
		});

		it('previene líneas duplicadas: suma cantidades para la misma variante', () => {
			useCartStore.getState().addItem(baseItem({ quantity: 1 }));
			useCartStore.getState().addItem(baseItem({ quantity: 2 }));

			const state = useCartStore.getState();
			expect(state.items).toHaveLength(1);
			expect(state.items[0].quantity).toBe(3);
		});

		it('permite la misma variante suelta y dentro de un combo como líneas separadas', () => {
			useCartStore.getState().addItem(baseItem());
			useCartStore.getState().addItem(baseItem({ comboId: 'combo-1', comboName: 'Combo familiar' }));

			expect(useCartStore.getState().items).toHaveLength(2);
		});

		it('rechaza agregar cuando no hay stock disponible', () => {
			const result = useCartStore.getState().addItem(baseItem({ quantity: 1 }), 0);

			expect(result).toEqual({ ok: false, reason: 'OUT_OF_STOCK', availableStock: 0 });
			expect(useCartStore.getState().items).toHaveLength(0);
		});

		it('rechaza agregar más unidades de las disponibles en stock', () => {
			useCartStore.getState().addItem(baseItem({ quantity: 2 }), 3);
			const result = useCartStore.getState().addItem(baseItem({ quantity: 2 }), 3);

			expect(result).toEqual({ ok: false, reason: 'INSUFFICIENT_STOCK', availableStock: 3 });
			// La cantidad no debió modificarse tras el intento rechazado.
			expect(useCartStore.getState().items[0].quantity).toBe(2);
		});
	});

	describe('addCombo', () => {
		const combo: ComboWithItems = {
			id: 'combo-1',
			nombre: 'Combo familiar',
			slug: 'combo-familiar',
			descripcion: null,
			precio_combo_usd: 20,
			activo: true,
			created_at: new Date().toISOString(),
			combo_items: [
				{
					id: 'ci-1',
					cantidad: 2,
					variant_id: 'arroz-5lb',
					variants: {
						id: 'arroz-5lb',
						color_name: '',
						storage: '',
						price: 5.9,
						products: { name: 'Arroz', images: ['/arroz.jpg'] },
					},
					catalog_variant_id: null,
					catalog_product_variants: null,
				},
				{
					id: 'ci-2',
					cantidad: 1,
					variant_id: 'aceite-1l',
					variants: {
						id: 'aceite-1l',
						color_name: '',
						storage: '',
						price: 6.5,
						products: { name: 'Aceite', images: ['/aceite.jpg'] },
					},
					catalog_variant_id: null,
					catalog_product_variants: null,
				},
			],
		};

		it('expande el combo en sus variantes con el precio prorrateado', () => {
			useCartStore.getState().addCombo(combo);

			const state = useCartStore.getState();
			expect(state.items).toHaveLength(2);
			expect(state.totalItemsInCart).toBe(3);
			// La suma de las líneas del combo debe dar exactamente el precio del combo.
			expect(state.subtotal).toBeCloseTo(20);
		});
	});

	describe('updateQuantity', () => {
		it('actualiza la cantidad de una línea existente', () => {
			useCartStore.getState().addItem(baseItem({ quantity: 1 }));
			const result = useCartStore.getState().updateQuantity('arroz-5lb', 5);

			expect(result).toEqual({ ok: true });
			expect(useCartStore.getState().items[0].quantity).toBe(5);
		});

		it('ignora cantidades menores a 1', () => {
			useCartStore.getState().addItem(baseItem({ quantity: 2 }));
			useCartStore.getState().updateQuantity('arroz-5lb', 0);

			expect(useCartStore.getState().items[0].quantity).toBe(2);
		});

		it('valida el stock disponible antes de actualizar', () => {
			useCartStore.getState().addItem(baseItem({ quantity: 1 }));
			const result = useCartStore.getState().updateQuantity('arroz-5lb', 10, undefined, 4);

			expect(result).toEqual({ ok: false, reason: 'INSUFFICIENT_STOCK', availableStock: 4 });
			expect(useCartStore.getState().items[0].quantity).toBe(1);
		});
	});

	describe('removeItem', () => {
		it('elimina solo la línea que coincide con variantId y comboId', () => {
			useCartStore.getState().addItem(baseItem());
			useCartStore.getState().addItem(baseItem({ comboId: 'combo-1' }));

			useCartStore.getState().removeItem('arroz-5lb');

			const state = useCartStore.getState();
			expect(state.items).toHaveLength(1);
			expect(state.items[0].comboId).toBe('combo-1');
		});
	});

	describe('cleanCart', () => {
		it('vacía el carrito y quita el cupón y el costo de entrega', () => {
			useCartStore.getState().addItem(baseItem({ quantity: 2 }));
			useCartStore.getState().applyCoupon('BIENVENIDA10');
			useCartStore.getState().setDeliveryCost(5);

			useCartStore.getState().cleanCart();

			const state = useCartStore.getState();
			expect(state.items).toHaveLength(0);
			expect(state.coupon).toBeNull();
			expect(state.deliveryCost).toBe(0);
			expect(state.total).toBe(0);
		});
	});

	describe('cupones', () => {
		it('aplica un cupón porcentual válido y recalcula el descuento', () => {
			useCartStore.getState().addItem(baseItem({ price: 10, quantity: 2 }));
			const result = useCartStore.getState().applyCoupon('bienvenida10');

			expect(result.ok).toBe(true);
			const state = useCartStore.getState();
			expect(state.coupon?.code).toBe('BIENVENIDA10');
			expect(state.discount).toBeCloseTo(2);
			expect(state.total).toBeCloseTo(18);
		});

		it('rechaza un código de cupón inexistente', () => {
			const result = useCartStore.getState().applyCoupon('NOEXISTE');

			expect(result).toEqual({ ok: false, reason: 'NOT_FOUND' });
			expect(useCartStore.getState().coupon).toBeNull();
		});

		it('rechaza un cupón vencido', () => {
			const result = useCartStore.getState().applyCoupon('VENCIDO5');

			expect(result).toEqual({ ok: false, reason: 'EXPIRED' });
		});

		it('rechaza un cupón cuando no se alcanza el subtotal mínimo', () => {
			useCartStore.getState().addItem(baseItem({ price: 10, quantity: 1 }));
			const result = useCartStore.getState().applyCoupon('CUBA20');

			expect(result).toEqual({ ok: false, reason: 'MIN_SUBTOTAL_NOT_MET', minSubtotal: 100 });
		});

		it('quita el cupón aplicado y recalcula el total', () => {
			useCartStore.getState().addItem(baseItem({ price: 10, quantity: 2 }));
			useCartStore.getState().applyCoupon('BIENVENIDA10');

			useCartStore.getState().removeCoupon();

			const state = useCartStore.getState();
			expect(state.coupon).toBeNull();
			expect(state.discount).toBe(0);
			expect(state.total).toBeCloseTo(20);
		});

		it('nunca aplica un descuento mayor al subtotal', () => {
			useCartStore.getState().addItem(baseItem({ price: 3, quantity: 1 }));
			// ENVIOGRATIS es un cupón fijo de $5, mayor que el subtotal de $3.
			useCartStore.getState().applyCoupon('ENVIOGRATIS');

			const state = useCartStore.getState();
			expect(state.discount).toBe(3);
			expect(state.total).toBe(0);
		});
	});

	describe('costo de entrega', () => {
		it('suma el costo de entrega al total', () => {
			useCartStore.getState().addItem(baseItem({ price: 10, quantity: 1 }));
			useCartStore.getState().setDeliveryCost(4.5);

			expect(useCartStore.getState().total).toBeCloseTo(14.5);
		});
	});

	describe('precisión decimal', () => {
		it('suma montos con problemas clásicos de punto flotante sin arrastrar el error', () => {
			useCartStore.getState().addItem(baseItem({ variantId: 'a', price: 0.1, quantity: 1 }));
			useCartStore.getState().addItem(baseItem({ variantId: 'b', price: 0.2, quantity: 1 }));

			expect(useCartStore.getState().subtotal).toBe(0.3);
		});
	});

	describe('persistencia', () => {
		it('persiste el carrito en localStorage tras cada mutación', () => {
			useCartStore.getState().addItem(baseItem({ quantity: 2 }));

			const raw = localStorage.getItem('cart-store');
			expect(raw).not.toBeNull();

			const parsed = JSON.parse(raw as string);
			expect(parsed.state.items).toHaveLength(1);
			expect(parsed.state.items[0].variantId).toBe('arroz-5lb');
			// Los totales derivados no deben persistirse: se recalculan al hidratar.
			expect(parsed.state.subtotal).toBeUndefined();
		});

		it('sanea un carrito persistido corrupto en vez de romper al hidratar', async () => {
			localStorage.setItem(
				'cart-store',
				JSON.stringify({
					state: {
						items: 'no-es-un-arreglo',
						coupon: { code: 123 },
						deliveryCost: 'gratis',
					},
					version: 1,
				})
			);

			vi.resetModules();
			const { useCartStore: freshStore } = await import('../cart.store');

			const state = freshStore.getState();
			expect(state.items).toEqual([]);
			expect(state.coupon).toBeNull();
			expect(state.deliveryCost).toBe(0);
			expect(state.hasHydrated).toBe(true);
		});

		it('descarta líneas de carrito con forma inválida y conserva las válidas', async () => {
			localStorage.setItem(
				'cart-store',
				JSON.stringify({
					state: {
						items: [baseItem({ quantity: 2 }), { variantId: 'incompleto' }],
						coupon: null,
						deliveryCost: 0,
					},
					version: 1,
				})
			);

			vi.resetModules();
			const { useCartStore: freshStore } = await import('../cart.store');

			const state = freshStore.getState();
			expect(state.items).toHaveLength(1);
			expect(state.items[0].variantId).toBe('arroz-5lb');
			expect(state.subtotal).toBeCloseTo(11.8);
		});
	});
});
