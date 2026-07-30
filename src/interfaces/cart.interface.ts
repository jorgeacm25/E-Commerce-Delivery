export type CouponType = 'percentage' | 'fixed';

// Cupón ya validado y aplicado al carrito. `value` se interpreta según
// `type`: porcentaje (0-100) o monto fijo en USD.
export interface CartCoupon {
	code: string;
	type: CouponType;
	value: number;
	description: string;
}

// Definición de un cupón disponible en el catálogo simulado de cupones
// (ver src/data/coupons.mock.ts), con las condiciones que determinan si
// puede aplicarse (monto mínimo, vigencia).
export interface CouponDefinition extends CartCoupon {
	minSubtotal?: number;
	expiresAt?: string;
}

export interface CartTotals {
	subtotal: number;
	discount: number;
	deliveryCost: number;
	total: number;
}
