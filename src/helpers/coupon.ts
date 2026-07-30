import Decimal from 'decimal.js';
import { mockCoupons } from '../data/coupons.mock';
import { CartCoupon } from '../interfaces';

export type ApplyCouponResult =
	| { ok: true; coupon: CartCoupon }
	| { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'MIN_SUBTOTAL_NOT_MET'; minSubtotal?: number };

// Busca un cupón por código en el catálogo simulado (ver
// src/data/coupons.mock.ts) y valida vigencia y monto mínimo contra el
// subtotal actual del carrito.
export const findCoupon = (code: string, subtotal: number): ApplyCouponResult => {
	const normalizedCode = code.trim().toUpperCase();
	const found = mockCoupons.find(coupon => coupon.code === normalizedCode);

	if (!found) {
		return { ok: false, reason: 'NOT_FOUND' };
	}

	if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
		return { ok: false, reason: 'EXPIRED' };
	}

	if (found.minSubtotal !== undefined && subtotal < found.minSubtotal) {
		return { ok: false, reason: 'MIN_SUBTOTAL_NOT_MET', minSubtotal: found.minSubtotal };
	}

	const { code: couponCode, type, value, description } = found;

	return { ok: true, coupon: { code: couponCode, type, value, description } };
};

// Calcula el descuento en USD para un subtotal dado. Usa decimal.js (en vez
// de aritmética float encadenada) porque el resultado se suma después al
// resto de los totales del carrito.
export const calculateDiscount = (subtotal: number, coupon: CartCoupon | null): number => {
	if (!coupon || subtotal <= 0) return 0;

	const rawDiscount =
		coupon.type === 'percentage'
			? new Decimal(subtotal).times(coupon.value).dividedBy(100)
			: new Decimal(coupon.value);

	// El descuento nunca puede superar el subtotal (evita totales negativos).
	return Decimal.min(rawDiscount, subtotal).toDecimalPlaces(2).toNumber();
};
