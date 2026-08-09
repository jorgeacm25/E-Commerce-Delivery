import { supabase } from '../supabase/client';
import { SupportCase, SupportCaseInput } from '../interfaces';

type SupportCaseRow = {
	id: string;
	profile_id: string;
	category: string;
	subject: string;
	message: string;
	order_reference: string | null;
	status: string;
	created_at: string;
	updated_at: string;
};

const mapSupportCaseRow = (row: SupportCaseRow): SupportCase => ({
	id: row.id,
	profileId: row.profile_id,
	category: row.category as SupportCase['category'],
	subject: row.subject,
	message: row.message,
	orderReference: row.order_reference,
	status: row.status as SupportCase['status'],
	createdAt: row.created_at,
	updatedAt: row.updated_at,
});

export const getSupportCases = async (profileId: string): Promise<SupportCase[]> => {
	const { data, error } = await supabase
		.from('support_cases')
		.select('*')
		.eq('profile_id', profileId)
		.order('created_at', { ascending: false });

	if (error) throw new Error('No pudimos cargar tus casos de soporte.');

	return (data as SupportCaseRow[]).map(mapSupportCaseRow);
};

export const createSupportCase = async (
	profileId: string,
	input: SupportCaseInput
): Promise<SupportCase> => {
	const { data, error } = await supabase
		.from('support_cases')
		.insert({
			profile_id: profileId,
			category: input.category,
			subject: input.subject,
			message: input.message,
			order_reference: input.orderReference ?? null,
		})
		.select()
		.single();

	if (error) throw new Error('No pudimos crear el caso de soporte.');

	return mapSupportCaseRow(data as SupportCaseRow);
};
