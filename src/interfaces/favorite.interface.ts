// Favorito del cliente, contra el backend .NET real (api/favorite).
// `productId` referencia un producto real del catálogo (api/product).
export interface Favorite {
	id: string;
	customerId: string;
	productId: string;
	createdAt: string;
}
