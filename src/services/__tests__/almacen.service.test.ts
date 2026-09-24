import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getWarehouseHistory, getStockAlerts, registerProductIn, registerProductOut } from '../almacen.service';

const apiFetchMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const currentProductDto = {
	id: 'p-1',
	name: 'Arroz',
	quantity: 5,
	unity: 'lb',
	salePriceUsd: 2,
	discountPriceUsd: null,
	endDate: '2026-12-31T00:00:00Z',
	nameUserorAdmin: 'admin',
	categoryId: 'c-1',
	categoryName: 'Despensa',
	provider: 'Proveedor X',
	updateAt: '2026-01-01T00:00:00Z',
	images: ['img-1'],
};

describe('almacen.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getWarehouseHistory', () => {
		it('pide el historial y lo ordena del más reciente al más antiguo', async () => {
			apiFetchMock.mockResolvedValue([
				{ id: 'h-1', actionType: 'Entrada', userOrAdminUserName: 'Admin', description: 'a', createdAt: '2026-01-01T00:00:00Z' },
				{ id: 'h-2', actionType: 'Salida', userOrAdminUserName: 'Admin', description: 'b', createdAt: '2026-02-01T00:00:00Z' },
			]);

			const result = await getWarehouseHistory();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/history');
			expect(result.map(entry => entry.id)).toEqual(['h-2', 'h-1']);
		});
	});

	describe('getStockAlerts', () => {
		it('deriva alertas de stock bajo y vencimiento próximo desde /api/product', async () => {
			const now = Date.now();
			const soon = new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString();
			const far = new Date(now + 200 * 24 * 60 * 60 * 1000).toISOString();

			apiFetchMock.mockResolvedValue([
				{ id: 'p-1', name: 'Arroz', quantity: 5, unity: 'lb', endDate: far },
				{ id: 'p-2', name: 'Leche', quantity: 50, unity: 'unidad', endDate: soon },
				{ id: 'p-3', name: 'Aceite', quantity: 100, unity: 'unidad', endDate: far },
			]);

			const result = await getStockAlerts();

			expect(apiFetchMock).toHaveBeenCalledWith('/api/product', { auth: false });
			expect(result.map(alert => alert.productId)).toEqual(['p-1', 'p-2']);
		});

		it('devuelve lista vacía cuando ningún producto tiene alertas', async () => {
			const far = new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString();
			apiFetchMock.mockResolvedValue([
				{ id: 'p-1', name: 'Arroz', quantity: 100, unity: 'lb', endDate: far },
			]);

			const result = await getStockAlerts();

			expect(result).toEqual([]);
		});
	});

	describe('registerProductOut', () => {
		it('registra la salida con los productos y el actor', async () => {
			apiFetchMock.mockResolvedValue(null);

			await registerProductOut(
				{ productId: 'p-1', quantity: 3, motive: 'merma', customer: 'Cliente X' },
				{ adminId: 'admin-1', userId: null }
			);

			expect(apiFetchMock).toHaveBeenCalledWith('/api/productOut', {
				method: 'POST',
				body: expect.objectContaining({
					products: [{ id: 'p-1', quantity: 3 }],
					outMotive: 'merma',
					adminId: 'admin-1',
					userId: null,
					customer: 'Cliente X',
				}),
			});
		});
	});

	describe('registerProductIn', () => {
		it('suma la cantidad al stock actual y envía el total con el actor', async () => {
			apiFetchMock.mockResolvedValueOnce(currentProductDto).mockResolvedValueOnce(null);

			await registerProductIn(
				{ productId: 'p-1', quantity: 3, provider: 'Proveedor Y' },
				{ adminId: 'admin-1', userId: null }
			);

			expect(apiFetchMock).toHaveBeenNthCalledWith(1, '/api/product/p-1', { auth: false });
			expect(apiFetchMock).toHaveBeenNthCalledWith(2, '/api/product', {
				method: 'PUT',
				body: expect.objectContaining({
					id: 'p-1',
					quantity: 8,
					salePriceUsd: 2,
					discountPriceUsd: null,
					endDate: null,
					adminId: 'admin-1',
					userId: null,
					provider: 'Proveedor Y',
					categoryId: 'c-1',
					images: ['img-1'],
				}),
			});
		});

		it('manda la fecha como lote nuevo solo si es distinta del vencimiento actual', async () => {
			apiFetchMock.mockResolvedValueOnce(currentProductDto).mockResolvedValueOnce(null);

			await registerProductIn(
				{ productId: 'p-1', quantity: 3, provider: 'Proveedor X', endDate: '2027-06-15' },
				{ adminId: null, userId: 'user-1' }
			);

			expect(apiFetchMock).toHaveBeenNthCalledWith(2, '/api/product', {
				method: 'PUT',
				body: expect.objectContaining({
					endDate: '2027-06-15T00:00:00.000Z',
					adminId: null,
					userId: 'user-1',
				}),
			});
		});

		it('rechaza sin hacer el PUT cuando el stock actual tiene decimales', async () => {
			apiFetchMock.mockResolvedValueOnce({ ...currentProductDto, quantity: 5.5 });

			await expect(
				registerProductIn({ productId: 'p-1', quantity: 3, provider: 'Proveedor X' }, { adminId: 'admin-1', userId: null })
			).rejects.toThrow(/decimales/);

			expect(apiFetchMock).toHaveBeenCalledTimes(1);
		});
	});
});
