import { apiFetch } from '../api/client';
import { HistoryEntry, ProductOutResultDto, ProductResultDto } from '../api/types';
import {
	InventoryMetrics,
	RegisterProductInInput,
	RegisterProductOutInput,
	StockAlert,
} from '../interfaces';
import { toUtcDateTime } from '../helpers';
import { getAdminProductById } from './adminProducts.service';

const LOW_STOCK_THRESHOLD = 10;
const EXPIRING_SOON_DAYS = 30;

export const getWarehouseHistory = async (): Promise<HistoryEntry[]> => {
	const history = await apiFetch<HistoryEntry[]>('/api/history');
	return history.slice().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
};

// No hay query de "stock bajo"/"por vencer" en el backend — se deriva en el
// cliente a partir de GET /api/product (que ya trae quantity y endDate),
// mismo enfoque pragmático que adminOrders.service.ts para el resumen del
// dashboard.
export const getStockAlerts = async (): Promise<StockAlert[]> => {
	const products = await apiFetch<ProductResultDto[]>('/api/product', { auth: false });
	const now = Date.now();

	return products
		.map((product): StockAlert => {
			const daysUntilExpiration = product.endDate
				? Math.ceil((new Date(product.endDate).getTime() - now) / (1000 * 60 * 60 * 24))
				: null;
			return {
				productId: product.id,
				productName: product.name,
				stock: product.quantity,
				unit: product.unity,
				endDate: product.endDate,
				daysUntilExpiration,
			};
		})
		.filter(
			alert =>
				alert.stock <= LOW_STOCK_THRESHOLD ||
				(alert.daysUntilExpiration !== null && alert.daysUntilExpiration <= EXPIRING_SOON_DAYS)
		)
		.sort((a, b) => a.stock - b.stock);
};

export const registerProductOut = async (
	input: RegisterProductOutInput,
	actor: { adminId: string | null; userId: string | null }
): Promise<void> => {
	await apiFetch('/api/productOut', {
		method: 'POST',
		body: {
			products: [{ id: input.productId, quantity: input.quantity }],
			productOutDate: new Date().toISOString(),
			outMotive: input.motive,
			adminId: actor.adminId,
			userId: actor.userId,
			customer: input.customer ?? null,
		},
	});
};

// El backend no tiene endpoint propio de "entrada": el handler de
// PUT /api/product ya escribe el movimiento `Entrada` en api/history con el
// delta calculado server-side, así que una entrada = reabastecimiento vía
// Update. Se relee el producto al confirmar para que el total nuevo no parta
// de una lista vieja (el stock pudo cambiar con el modal abierto), y el resto
// de campos (precio, descuento, categoría, imágenes) se mandan tal cual para
// no tocarlos — las imágenes son solo URLs existentes, nunca pasan por
// upload/borrado. `endDate` solo si es un lote nuevo (mismo criterio que
// updateProduct).
export const registerProductIn = async (
	input: RegisterProductInInput,
	actor: { adminId: string | null; userId: string | null }
): Promise<void> => {
	const current = await getAdminProductById(input.productId);
	const newTotal = current.stock + input.quantity;

	// UpdateProductEntityCommand.Quantity es `int` en el backend: mandar un
	// total con decimales (posible si el stock actual lo tiene) daría un 400
	// ilegible, así que se avisa antes de hacer el PUT.
	if (!Number.isInteger(newTotal)) {
		throw new Error(
			`El stock actual (${current.stock}) tiene decimales: registra este reabastecimiento desde la ficha del producto para fijar un total entero.`
		);
	}

	const currentDateOnly = current.endDate ? current.endDate.slice(0, 10) : '';
	const nextEndDate = input.endDate && input.endDate !== currentDateOnly ? input.endDate : null;

	await apiFetch('/api/product', {
		method: 'PUT',
		body: {
			id: current.id,
			quantity: newTotal,
			salePriceUsd: current.priceUsd,
			discountPriceUsd: current.discountPriceUsd,
			// El backend solo cambia el costo si llega un valor — se
			// reenvía el actual para que un PUT "a ciegas" no lo borre.
			costCup: current.costCup,
			endDate: nextEndDate ? toUtcDateTime(nextEndDate) : null,
			adminId: actor.adminId,
			userId: actor.userId,
			provider: input.provider,
			dateIn: new Date().toISOString(),
			categoryId: current.categoryId,
			images: current.images,
		},
	});
};

// Salidas de stock estructuradas (api/productOut): filas manuales del
// almacén y ventas web, con ProductId y cantidad exacta — la fuente real
// para la columna "Salidas" del inventario (el histórico de texto queda
// solo para display). Requiere sesión (GET agregado en la sección Inventario).
export const getProductOuts = async (): Promise<ProductOutResultDto[]> => {
	const outs = await apiFetch<ProductOutResultDto[]>('/api/productOut');
	return outs.slice().sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
};

// Escapa los caracteres con significado en regex para poder buscar nombres
// de producto literales ("R$ 500 (2 und.)", "Pan + mantequilla"...).
const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Métricas por producto para la tabla de Inventario:
// - salidas: suma de unidades y nº de movimientos desde api/productOut.
// - última entrada: parsea los mensajes `Entrada` de api/history (el
//   backend no tiene entidad de entrada ni guarda ids en el histórico).
//   Formatos reales (UpdateProductEntityCommandHandler): "...del producto:
//   {nombre}" seguido de "\n" (rama admin) o " ," (rama user) — el
//   lookahead cubre ambos y evita emparejar "Pan" con "Pan integral".
//   Límite conocido: dos productos con el mismo nombre compartirían fecha.
export const buildInventoryMetrics = (
	products: { id: string; name: string }[],
	history: HistoryEntry[],
	productOuts: ProductOutResultDto[]
): Map<string, InventoryMetrics> => {
	const metrics = new Map<string, InventoryMetrics>();
	const ensure = (id: string): InventoryMetrics => {
		const existing = metrics.get(id);
		if (existing) return existing;
		const created: InventoryMetrics = { lastEntryAt: null, outsUnits: 0, outsMovements: 0 };
		metrics.set(id, created);
		return created;
	};

	for (const out of productOuts) {
		const target = ensure(out.productId);
		target.outsUnits += out.quantity;
		target.outsMovements += 1;
	}

	for (const entry of history) {
		if (entry.actionType !== 'Entrada') continue;
		for (const product of products) {
			const pattern = new RegExp(`producto:\\s*${escapeRegExp(product.name)}\\s*(?=\\n|,)`, 'i');
			if (!pattern.test(entry.description)) continue;
			const target = ensure(product.id);
			if (!target.lastEntryAt || entry.createdAt > target.lastEntryAt) {
				target.lastEntryAt = entry.createdAt;
			}
		}
	}

	return metrics;
};
