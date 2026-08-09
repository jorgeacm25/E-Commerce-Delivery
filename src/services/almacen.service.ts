import { apiFetch } from '../api/client';
import { HistoryEntry, ProductResultDto } from '../api/types';
import { RegisterProductOutInput, StockAlert } from '../interfaces';

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
