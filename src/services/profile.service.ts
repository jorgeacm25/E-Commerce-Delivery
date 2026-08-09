import { supabase } from '../supabase/client';
import { Profile } from '../interfaces';

export interface UpdateProfileInput {
	fullName: string;
	phone?: string;
}

const mapProfileRow = (row: {
	id: string;
	full_name: string;
	phone: string | null;
	role: string;
	status: string;
	created_at: string;
	updated_at: string;
}): Profile => ({
	id: row.id,
	fullName: row.full_name,
	phone: row.phone,
	role: row.role as Profile['role'],
	status: row.status as Profile['status'],
	createdAt: row.created_at,
	updatedAt: row.updated_at,
});

export const updateProfile = async (id: string, input: UpdateProfileInput): Promise<Profile> => {
	const { data, error } = await supabase
		.from('profiles')
		.update({ full_name: input.fullName, phone: input.phone ?? null })
		.eq('id', id)
		.select()
		.single();

	if (error) throw new Error('No pudimos actualizar tu perfil.');

	return mapProfileRow(data);
};
