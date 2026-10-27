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

// Entrada (reabastecimiento) registrada desde /admin/almacen. El backend no
// tiene endpoint propio de entrada — el handler de PUT /api/product ya
// escribe el movimiento `Entrada` en api/history, así que la "entrada" es
// una actualización de stock (ver registerProductIn en
// src/services/almacen.service.ts). `endDate` opcional = vencimiento de un
// lote nuevo (mismo comportamiento que el formulario de producto).
export interface RegisterProductInInput {
	productId: string;
	quantity: number;
	provider: string;
	endDate?: string;
}

// Métricas derivadas por producto para la tabla de Inventario. La última
// entrada se parsea de los mensajes del histórico (api/history no guarda
// ids de producto) y las salidas suman las filas estructuradas de
// api/productOut. Ver buildInventoryMetrics en src/services/almacen.service.ts.
export interface InventoryMetrics {
	lastEntryAt: string | null;
	outsUnits: number;
	outsMovements: number;
}
