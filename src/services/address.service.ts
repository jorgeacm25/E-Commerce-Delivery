import { supabase } from '../supabase/client';
import { CustomerAddress, CustomerAddressInput } from '../interfaces';

type AddressRow = {
	id: string;
	profile_id: string;
	label: string | null;
	province: string;
	municipality: string;
	address_line: string;
	reference_notes: string | null;
	is_default: boolean;
	created_at: string;
	updated_at: string;
};

const mapAddressRow = (row: AddressRow): CustomerAddress => ({
	id: row.id,
	profileId: row.profile_id,
	label: row.label,
	province: row.province,
	municipality: row.municipality,
	addressLine: row.address_line,
	referenceNotes: row.reference_notes,
	isDefault: row.is_default,
	createdAt: row.created_at,
	updatedAt: row.updated_at,
});

export const getAddresses = async (profileId: string): Promise<CustomerAddress[]> => {
	const { data, error } = await supabase
		.from('customer_addresses')
		.select('*')
		.eq('profile_id', profileId)
		.order('is_default', { ascending: false })
		.order('created_at', { ascending: false });

	if (error) throw new Error('No pudimos cargar tus direcciones.');

	return (data as AddressRow[]).map(mapAddressRow);
};

export const createAddress = async (
	profileId: string,
	input: CustomerAddressInput
): Promise<CustomerAddress> => {
	const { data, error } = await supabase
		.from('customer_addresses')
		.insert({
			profile_id: profileId,
			label: input.label ?? null,
			province: input.province,
			municipality: input.municipality,
			address_line: input.addressLine,
			reference_notes: input.referenceNotes ?? null,
			is_default: input.isDefault ?? false,
		})
		.select()
		.single();

	if (error) throw new Error('No pudimos guardar la dirección.');

	return mapAddressRow(data as AddressRow);
};

export const updateAddress = async (
	id: string,
	input: CustomerAddressInput
): Promise<CustomerAddress> => {
	const { data, error } = await supabase
		.from('customer_addresses')
		.update({
			label: input.label ?? null,
			province: input.province,
			municipality: input.municipality,
			address_line: input.addressLine,
			reference_notes: input.referenceNotes ?? null,
			is_default: input.isDefault ?? false,
		})
		.eq('id', id)
		.select()
		.single();

	if (error) throw new Error('No pudimos actualizar la dirección.');

	return mapAddressRow(data as AddressRow);
};

export const deleteAddress = async (id: string): Promise<void> => {
	const { error } = await supabase.from('customer_addresses').delete().eq('id', id);

	if (error) throw new Error('No pudimos eliminar la dirección.');
};
