import { apiFetch, ApiError } from '../api/client';
import { FavoriteResultDto } from '../api/types';
import { Favorite } from '../interfaces';

// Favoritos reales, contra el backend .NET (api/favorite) — antes escribía
// a Supabase (`favorites`, RLS `auth.uid() = profile_id`), rota desde que
// el login es 100% .NET (ver docs/PROJECT_STATE.md). `productId` ya
// referencia un producto real del catálogo (api/product), no un slug
// simulado.
const mapFavorite = (dto: FavoriteResultDto): Favorite => ({
	id: dto.id ?? '',
	customerId: dto.customerId ?? '',
	productId: dto.productId ?? '',
	createdAt: dto.createdAt ?? '',
});

export const getFavorites = async (customerId: string): Promise<Favorite[]> => {
	const dtos = await apiFetch<FavoriteResultDto[]>(`/api/favorite/customer/${customerId}`);
	return dtos.map(mapFavorite).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

// El backend rechaza un favorito duplicado (400, "Este producto ya está en
// tus favoritos") en vez de aceptarlo en silencio — se trata como éxito
// idempotente acá (doble clic, pestañas duplicadas), mismo criterio que la
// versión anterior sobre Supabase.
export const addFavorite = async (customerId: string, productId: string): Promise<void> => {
	try {
		await apiFetch('/api/favorite', { method: 'POST', body: { customerId, productId } });
	} catch (error) {
		if (error instanceof ApiError && error.status === 400 && /ya está en tus favoritos/i.test(error.message)) {
			return;
		}
		throw error;
	}
};

// A diferencia de Supabase (delete por profileId+productId), el backend
// borra por el id propio del favorito (DELETE /api/favorite/{id}) — el
// caller (useToggleFavorite) resuelve ese id desde la lista ya cargada.
export const removeFavorite = async (favoriteId: string): Promise<void> => {
	await apiFetch(`/api/favorite/${favoriteId}`, { method: 'DELETE' });
};
