import { apiFetch } from '../api/client';
import { SupportCaseResultDto } from '../api/types';
import { SupportCase, SupportCaseInput } from '../interfaces';

// Casos de soporte reales, contra el backend .NET (api/supportCase) — antes
// escribía a Supabase (`support_cases`, RLS `auth.uid() = profile_id`),
// rota desde que el login es 100% .NET (ver docs/PROJECT_STATE.md). Crear
// no devuelve el caso (Result<Unit>): el caller refresca el listado (ver
// useCreateSupportCase.ts, ya invalida ['support-cases', customerId]).
const mapSupportCase = (dto: SupportCaseResultDto): SupportCase => ({
	id: dto.id ?? '',
	customerId: dto.customerId ?? '',
	category: (dto.category as SupportCase['category']) ?? 'otro',
	subject: dto.subject ?? '',
	message: dto.message ?? '',
	orderReference: dto.orderReference,
	status: (dto.status as SupportCase['status']) ?? 'abierto',
	createdAt: dto.createdAt ?? '',
	updatedAt: dto.updatedAt ?? '',
});

export const getSupportCases = async (customerId: string): Promise<SupportCase[]> => {
	const dtos = await apiFetch<SupportCaseResultDto[]>(`/api/supportCase/customer/${customerId}`);
	return dtos.map(mapSupportCase).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const createSupportCase = async (customerId: string, input: SupportCaseInput): Promise<void> => {
	await apiFetch('/api/supportCase', {
		method: 'POST',
		body: {
			customerId,
			category: input.category,
			subject: input.subject,
			message: input.message,
			orderReference: input.orderReference ?? null,
		},
	});
};
