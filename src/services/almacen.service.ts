import { apiFetch } from '../api/client';
import { HistoryEntry, ProductResultDto } from '../api/types';
import { RegisterProductInInput, RegisterProductOutInput, StockAlert } from '../interfaces';
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
