// Favorito del cliente (tabla `favorites`, ver
// supabase/migrations/005_customer_account.sql). `productId` es el slug del
// catálogo simulado (src/services/catalog.service.ts) — no existe todavía
// una tabla `products` real para el dominio de comida, así que la fila de
// favorito solo referencia el producto por slug; el producto en sí sigue
// siendo mock, igual que el resto del catálogo público.
export interface Favorite {
	id: string;
	profileId: string;
	productId: string;
	createdAt: string;
}
