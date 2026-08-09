// Fase C del roadmap (Almacén), contra el backend .NET real (api/history,
// api/productOut). Las alertas de stock bajo/vencimiento no tienen query
// propia en el backend — se derivan en el cliente a partir de api/product
// (ver src/services/almacen.service.ts).
export interface StockAlert {
	productId: string;
	productName: string;
	stock: number;
	unit: string;
	endDate: string | null;
	daysUntilExpiration: number | null;
}

export interface RegisterProductOutInput {
	productId: string;
	quantity: number;
	motive: string;
	customer?: string;
}
