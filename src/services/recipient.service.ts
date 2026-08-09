import { supabase } from '../supabase/client';
import { CustomerRecipient, CustomerRecipientInput } from '../interfaces';

type RecipientRow = {
	id: string;
	profile_id: string;
	full_name: string;
	phone: string;
	national_id: string | null;
	province: string;
	municipality: string;
	address_line: string;
	notes: string | null;
	is_default: boolean;
	created_at: string;
	updated_at: string;
};

const mapRecipientRow = (row: RecipientRow): CustomerRecipient => ({
	id: row.id,
	profileId: row.profile_id,
	fullName: row.full_name,
	phone: row.phone,
	nationalId: row.national_id,
	province: row.province,
	municipality: row.municipality,
	addressLine: row.address_line,
	notes: row.notes,
	isDefault: row.is_default,
	createdAt: row.created_at,
	updatedAt: row.updated_at,
});

export const getRecipients = async (profileId: string): Promise<CustomerRecipient[]> => {
	const { data, error } = await supabase
		.from('customer_recipients')
		.select('*')
		.eq('profile_id', profileId)
		.order('is_default', { ascending: false })
		.order('created_at', { ascending: false });

	if (error) throw new Error('No pudimos cargar tus destinatarios.');

	return (data as RecipientRow[]).map(mapRecipientRow);
};

export const createRecipient = async (
	profileId: string,
	input: CustomerRecipientInput
): Promise<CustomerRecipient> => {
	const { data, error } = await supabase
		.from('customer_recipients')
		.insert({
			profile_id: profileId,
			full_name: input.fullName,
			phone: input.phone,
			national_id: input.nationalId ?? null,
			province: input.province,
			municipality: input.municipality,
			address_line: input.addressLine,
			notes: input.notes ?? null,
			is_default: input.isDefault ?? false,
		})
		.select()
		.single();

	if (error) throw new Error('No pudimos guardar el destinatario.');

	return mapRecipientRow(data as RecipientRow);
};

export const updateRecipient = async (
	id: string,
	input: CustomerRecipientInput
): Promise<CustomerRecipient> => {
	const { data, error } = await supabase
		.from('customer_recipients')
		.update({
			full_name: input.fullName,
			phone: input.phone,
			national_id: input.nationalId ?? null,
			province: input.province,
			municipality: input.municipality,
			address_line: input.addressLine,
			notes: input.notes ?? null,
			is_default: input.isDefault ?? false,
		})
		.eq('id', id)
		.select()
		.single();

	if (error) throw new Error('No pudimos actualizar el destinatario.');

	return mapRecipientRow(data as RecipientRow);
};

export const deleteRecipient = async (id: string): Promise<void> => {
	const { error } = await supabase.from('customer_recipients').delete().eq('id', id);

	if (error) throw new Error('No pudimos eliminar el destinatario.');
};
