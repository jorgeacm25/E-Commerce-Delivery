import { apiFetch } from '../api/client';

// Subida de archivos real, contra el backend .NET (api/files, ver
// FileUploadController en Almacen-Delivery-Home_Api_new) — reemplaza a
// Supabase Storage por completo (payment-proofs y product-images, ver
// docs/PROJECT_STATE.md). El backend guarda el archivo en disco
// (wwwroot/uploads/{folder}) y lo sirve como estático; folder es un
// namespace simple ("products", "payment-proofs"), no una ruta.
export const uploadFile = async (file: File, folder: string): Promise<string> => {
	const formData = new FormData();
	formData.append('file', file);

	const { url } = await apiFetch<{ url: string }>(`/api/files/upload?folder=${encodeURIComponent(folder)}`, {
		method: 'POST',
		body: formData,
	});

	return url;
};

// Idempotente (mismo criterio que el resto de la API): borrar un archivo
// que ya no existe no es un error.
export const deleteFile = async (url: string): Promise<void> => {
	await apiFetch(`/api/files?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
};
