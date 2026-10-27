import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createProduct, getAdminProductById, getAdminProducts, updateProduct } from '../adminProducts.service';

const apiFetchMock = vi.fn();
const uploadFileMock = vi.fn();
const deleteFileMock = vi.fn();

vi.mock('../../api/client', () => ({
	apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

vi.mock('../files.service', () => ({
	uploadFile: (...args: unknown[]) => uploadFileMock(...args),
	deleteFile: (...args: unknown[]) => deleteFileMock(...args),
}));

const productDto = {
	id: 'prod-1',
	name: 'Arroz',
	quantity: 10,
	unity: 'unidad',
	salePriceUsd: 5.9,
	endDate: '2026-12-01T00:00:00.000Z',
	nameUserorAdmin: 'staff',
	categoryId: 'cat-1',
	categoryName: 'Despensa',
	provider: 'Proveedor Demo',
	updateAt: '2026-01-01T00:00:00.000Z',
	images: ['https://cdn/product-images/catalog/prod-1/img.jpg'],
};

describe('adminProducts.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAdminProducts', () => {
		it('mapea, filtra por nombre/categoría y pagina en el cliente', async () => {
			apiFetchMock.mockResolvedValue([
				productDto,
				{ ...productDto, id: 'prod-2', name: 'Frijoles', categoryId: 'cat-2' },
			]);

			const result = await getAdminProducts({ query: 'arroz' });

			expect(apiFetchMock).toHaveBeenCalledWith('/api/product', { auth: false });
			expect(result.items).toHaveLength(1);
			expect(result.items[0].name).toBe('Arroz');
			expect(result.items[0].stock).toBe(10);
			expect(result.items[0].unit).toBe('unidad');
		});

		it('calcula la página correcta', async () => {
			apiFetchMock.mockResolvedValue(Array.from({ length: 25 }, (_, i) => ({ ...productDto, id: `p${i}` })));

			const result = await getAdminProducts({ page: 3, pageSize: 10 });

			expect(result.items).toHaveLength(5);
			expect(result.totalPages).toBe(3);
		});
	});

	describe('getAdminProductById', () => {
		it('mapea el producto', async () => {
			apiFetchMock.mockResolvedValue(productDto);

			const result = await getAdminProductById('prod-1');

			expect(apiFetchMock).toHaveBeenCalledWith('/api/product/prod-1', { auth: false });
			expect(result.categoryName).toBe('Despensa');
		});
	});

	describe('createProduct', () => {
		it('sube las imágenes y crea el producto con el actor correcto', async () => {
			uploadFileMock.mockResolvedValue('https://cdn/product-images/catalog/tmp/img.jpg');
			apiFetchMock.mockResolvedValue(productDto);

			const file = new File(['contenido'], 'img.jpg', { type: 'image/jpeg' });

			const result = await createProduct(
				{
					categoryId: 'cat-1',
					name: 'Arroz',
					unit: 'unidad',
					provider: 'Proveedor Demo',
					endDate: '2026-12-01',
					priceUsd: 5.9,
					discountPriceUsd: null,
					stock: 10,
					images: [file],
				},
				{ adminId: 'admin-1', userId: null }
			);

			expect(uploadFileMock).toHaveBeenCalledWith(file, 'products');
			expect(apiFetchMock).toHaveBeenCalledWith(
				'/api/product',
				expect.objectContaining({
					method: 'POST',
					body: expect.objectContaining({
						productName: 'Arroz',
						quantity: 10,
						adminId: 'admin-1',
						userId: null,
						images: ['https://cdn/product-images/catalog/tmp/img.jpg'],
					}),
				})
			);
			expect(result.id).toBe('prod-1');
		});
	});

	describe('updateProduct', () => {
		it('solo manda endDate cuando cambió respecto al actual', async () => {
			apiFetchMock.mockResolvedValue(productDto);

			await updateProduct(
				'prod-1',
				{
					categoryId: 'cat-1',
					name: 'Arroz',
					unit: 'unidad',
					provider: 'Proveedor Demo',
					endDate: '2026-12-01',
					priceUsd: 6.5,
					discountPriceUsd: null,
					stock: 20,
					images: ['https://cdn/product-images/catalog/prod-1/img.jpg'],
				},
				{ adminId: 'admin-1', userId: null },
				['https://cdn/product-images/catalog/prod-1/img.jpg'],
				'2026-12-01'
			);

			expect(apiFetchMock).toHaveBeenCalledWith(
				'/api/product',
				expect.objectContaining({
					method: 'PUT',
					body: expect.objectContaining({ id: 'prod-1', quantity: 20, endDate: null }),
				})
			);
		});
	});
});
