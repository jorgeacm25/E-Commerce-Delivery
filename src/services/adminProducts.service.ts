import { apiFetch } from '../api/client';
import { ProductResultDto } from '../api/types';
import { supabase } from '../supabase/client';
import { extractFilePath, toUtcDateTime } from '../helpers';
import { AdminProduct, AdminProductInput, AdminProductSearchParams, AdminProductSearchResult } from '../interfaces';

export interface ProductActorIds {
	adminId?: string | null;
	userId?: string | null;
}

const mapProduct = (dto: ProductResultDto): AdminProduct => ({
	id: dto.id,
	categoryId: dto.categoryId,
	categoryName: dto.categoryName ?? '',
	name: dto.name,
	unit: dto.unity,
	priceUsd: dto.salePriceUsd,
	discountPriceUsd: dto.discountPriceUsd,
	stock: dto.quantity,
	provider: dto.provider,
	endDate: dto.endDate,
	images: dto.images,
	createdByName: dto.nameUserorAdmin ?? '',
	updatedAt: dto.updateAt,
});

// El backend no soporta paginación/búsqueda/filtro server-side en
// GET /api/product (a diferencia del catálogo Supabase anterior) — se trae
// todo y se filtra/pagina en el cliente. Aceptable a esta escala (decenas de
// productos); revisar si el catálogo de almacén crece mucho.
export const getAdminProducts = async (
	params: AdminProductSearchParams = {}
): Promise<AdminProductSearchResult> => {
	const all = await apiFetch<ProductResultDto[]>('/api/product', { auth: false });
	let items = all.map(mapProduct);

	if (params.query) {
		const query = params.query.toLowerCase();
		items = items.filter(product => product.name.toLowerCase().includes(query));
	}
	if (params.categoryId) {
		items = items.filter(product => product.categoryId === params.categoryId);
	}

	const total = items.length;
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? 10;
	const from = (page - 1) * pageSize;

	return {
		items: items.slice(from, from + pageSize),
		total,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil(total / pageSize)),
	};
};

export const getAdminProductById = async (id: string): Promise<AdminProduct> => {
	const dto = await apiFetch<ProductResultDto>(`/api/product/${id}`, { auth: false });
	return mapProduct(dto);
};

// El backend no tiene endpoint de subida de archivos: las imágenes se suben
// a Supabase Storage (solo como blob storage, sin usar su Auth/Postgres
// para nada más) y se manda la URL resultante al backend real, que ya
// acepta `Images: string[]`.
const uploadProductImages = async (
	folderId: string,
	images: (File | string)[],
	existingImages: string[]
): Promise<string[]> => {
	const validImages = images.filter(Boolean);
	const imagesToDelete = existingImages.filter(image => !validImages.includes(image));

	if (imagesToDelete.length > 0) {
		const { error } = await supabase.storage
			.from('product-images')
			.remove(imagesToDelete.map(extractFilePath));

		if (error) throw new Error('No pudimos eliminar las imágenes anteriores.');
	}

	return Promise.all(
		validImages.map(async image => {
			if (typeof image === 'string') return image;

			const { data, error } = await supabase.storage
				.from('product-images')
				.upload(`catalog/${folderId}/${crypto.randomUUID()}-${image.name}`, image);

			if (error) throw new Error('No pudimos subir una de las imágenes.');

			return supabase.storage.from('product-images').getPublicUrl(data.path).data.publicUrl;
		})
	);
};

export const createProduct = async (
	input: AdminProductInput,
	actor: ProductActorIds
): Promise<AdminProduct> => {
	// Se sube a una carpeta temporal (no depende del id del producto, que
	// todavía no existe) para poder mandar las imágenes ya resueltas en el
	// mismo Create y evitar un segundo PUT — el backend registra cada PUT
	// como un reabastecimiento (ver adminProduct.interface.ts).
	const uploadedImages = await uploadProductImages(crypto.randomUUID(), input.images, []);

	const created = await apiFetch<ProductResultDto>('/api/product', {
		method: 'POST',
		body: {
			productName: input.name,
			quantity: input.stock,
			unity: input.unit,
			salePriceUsd: input.priceUsd,
			discountPriceUsd: input.discountPriceUsd,
			endDate: toUtcDateTime(input.endDate),
			provider: input.provider,
			adminId: actor.adminId ?? null,
			userId: actor.userId ?? null,
			categoryId: input.categoryId,
			images: uploadedImages,
		},
	});

	return mapProduct(created);
};

// El backend trata cada Update como un reabastecimiento: `stock` es la
// cantidad total nueva (no un delta) y, si se manda una fecha de
// vencimiento distinta a la ya registrada, se agrega como un lote nuevo al
// historial. Nombre y unidad no se pueden cambiar (el backend no los acepta
// en Update).
export const updateProduct = async (
	id: string,
	input: AdminProductInput,
	actor: ProductActorIds,
	currentImages: string[],
	currentEndDate: string
): Promise<AdminProduct> => {
	const uploadedImages = await uploadProductImages(id, input.images, currentImages);
	const nextEndDate = input.endDate && input.endDate !== currentEndDate ? input.endDate : null;

	const updated = await apiFetch<ProductResultDto>('/api/product', {
		method: 'PUT',
		body: {
			id,
			quantity: input.stock,
			salePriceUsd: input.priceUsd,
			discountPriceUsd: input.discountPriceUsd,
			endDate: nextEndDate ? toUtcDateTime(nextEndDate) : null,
			adminId: actor.adminId ?? null,
			userId: actor.userId ?? null,
			provider: input.provider,
			dateIn: new Date().toISOString(),
			categoryId: input.categoryId,
			images: uploadedImages,
		},
	});

	return mapProduct(updated);
};
