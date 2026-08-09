import { supabase } from '../supabase/client';
import { Favorite } from '../interfaces';

type FavoriteRow = {
	id: string;
	profile_id: string;
	product_id: string;
	created_at: string;
};

const mapFavoriteRow = (row: FavoriteRow): Favorite => ({
	id: row.id,
	profileId: row.profile_id,
	productId: row.product_id,
	createdAt: row.created_at,
});

export const getFavorites = async (profileId: string): Promise<Favorite[]> => {
	const { data, error } = await supabase
		.from('favorites')
		.select('*')
		.eq('profile_id', profileId)
		.order('created_at', { ascending: false });

	if (error) throw new Error('No pudimos cargar tus favoritos.');

	return (data as FavoriteRow[]).map(mapFavoriteRow);
};

export const addFavorite = async (profileId: string, productId: string): Promise<Favorite> => {
	const { data, error } = await supabase
		.from('favorites')
		.insert({ profile_id: profileId, product_id: productId })
		.select()
		.single();

	// 23505 = unique_violation: ya estaba marcado como favorito (doble clic,
	// pestañas duplicadas). Tratarlo como éxito idempotente en vez de error.
	if (error) {
		if (error.code === '23505') {
			const existing = await supabase
				.from('favorites')
				.select('*')
				.eq('profile_id', profileId)
				.eq('product_id', productId)
				.single();

			if (!existing.error) return mapFavoriteRow(existing.data as FavoriteRow);
		}

		throw new Error('No pudimos guardar el favorito.');
	}

	return mapFavoriteRow(data as FavoriteRow);
};

export const removeFavorite = async (profileId: string, productId: string): Promise<void> => {
	const { error } = await supabase
		.from('favorites')
		.delete()
		.eq('profile_id', profileId)
		.eq('product_id', productId);

	if (error) throw new Error('No pudimos quitar el favorito.');
};
