import { ComboInput, ComboWithItems } from '../interfaces';
import { supabase } from '../supabase/client';

const COMBO_SELECT = `*,
	combo_items(
		id, cantidad, variant_id,
		variants(id, color_name, storage, price, products(name, images))
	)`;

/* ********************************** */
/*      SELECTOR DE VARIANTES         */
/* ********************************** */

// Todas las variantes de todos los productos, para elegir qué incluir en un combo
export const getVariantsForComboSelector = async () => {
	const { data, error } = await supabase
		.from('products')
		.select('name, variants(id, color_name, storage, price)')
		.order('name', { ascending: true });

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return data;
};

/* ********************************** */
/*              PÚBLICO                */
/* ********************************** */

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

/* ********************************** */
/*           ADMINISTRADOR            */
/* ********************************** */

export const getAllCombosAdmin = async () => {
	const { data, error } = await supabase
		.from('combos')
		.select(COMBO_SELECT)
		.order('created_at', { ascending: false });

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return data as unknown as ComboWithItems[];
};

export const createCombo = async ({
	nombre,
	slug,
	descripcion,
	precioComboUsd,
	items,
}: ComboInput) => {
	const { data: combo, error: comboError } = await supabase
		.from('combos')
		.insert({
			nombre,
			slug,
			descripcion: descripcion ?? null,
			precio_combo_usd: precioComboUsd,
		})
		.select()
		.single();

	if (comboError) {
		console.log(comboError);
		throw new Error(comboError.message);
	}

	const { error: itemsError } = await supabase.from('combo_items').insert(
		items.map(item => ({
			combo_id: combo.id,
			variant_id: item.variantId,
			cantidad: item.cantidad,
		}))
	);

	if (itemsError) {
		console.log(itemsError);
		throw new Error(itemsError.message);
	}

	return combo;
};

export const setComboActivo = async (id: string, activo: boolean) => {
	const { error } = await supabase
		.from('combos')
		.update({ activo })
		.eq('id', id);

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}
};

export const deleteCombo = async (id: string) => {
	const { error } = await supabase.from('combos').delete().eq('id', id);

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}
};
