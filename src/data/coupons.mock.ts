import { CouponDefinition } from '../interfaces';

// Cupones simulados: no hay todavía una tabla `coupons` en Supabase, así
// que el carrito valida contra esta lista fija en memoria, siguiendo el
// mismo patrón de datos simulados de src/data/catalog.mock.ts y
// src/data/home.mock.ts.
export const mockCoupons: CouponDefinition[] = [
	{
		code: 'BIENVENIDA10',
		type: 'percentage',
		value: 10,
		description: '10% de descuento en tu primer pedido',
	},
	{
		code: 'ENVIOGRATIS',
		type: 'fixed',
		value: 5,
		description: '$5 de descuento equivalente al envío',
	},
	{
		code: 'CUBA20',
		type: 'percentage',
		value: 20,
		description: '20% de descuento en compras desde $100',
		minSubtotal: 100,
	},
	{
		code: 'VENCIDO5',
		type: 'fixed',
		value: 5,
		description: 'Cupón de prueba ya vencido',
		expiresAt: '2020-01-01T00:00:00.000Z',
	},
];
