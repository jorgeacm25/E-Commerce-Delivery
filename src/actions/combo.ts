import { ComboWithItems } from '../interfaces';
import { supabase } from '../supabase/client';

// combo_items.catalog_variant_id referencia catalog_product_variants
// (dominio comida, ver supabase/migrations/007_catalog_admin.sql y
// 008_combo_items_catalog_variants.sql). El campo legacy `variant_id`
// (celulares) se conserva en el select para no romper filas viejas.
//
// El panel admin de combos ya no usa este archivo (ver
// src/services/adminCombos.service.ts, contra el backend .NET real,
// api/combo) — queda solo getActiveCombos, todavía referenciada por el
// hook useActiveCombos, que a su vez solo usa la página pública legacy
// src/pages/CombosPage.tsx (no la que está enrutada hoy en
// src/pages/public/CombosPage.tsx).
const COMBO_SELECT = `*,
	combo_items(
		id, cantidad, variant_id, catalog_variant_id,
		variants(id, color_name, storage, price, products(name, images)),
		catalog_product_variants(id, label, price_usd, catalog_products(name, images))
	)`;

export const getActiveCombos = async () => {
	const { data, error } = await supabase
		.from('combos')
		.select(COMBO_SELECT)
		.eq('activo', true)
		.order('created_at', { ascending: false });

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return data as unknown as ComboWithItems[];
};
