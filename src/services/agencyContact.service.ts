import { apiFetch, ApiError } from '../api/client';
import { AgencyContactResultDto } from '../api/types';
import { AgencyContact } from '../interfaces';

const mapAgencyContact = (dto: AgencyContactResultDto): AgencyContact => ({
	id: dto.id ?? '',
	whatsappPhone: dto.whatsappPhone ?? '',
	vigenteDesde: dto.vigenteDesde ?? '',
	creadoPorAdminId: dto.creadoPorAdminId,
});

export const getActiveAgencyContact = async (): Promise<AgencyContact | null> => {
	try {
		const dto = await apiFetch<AgencyContactResultDto>('/api/agencyContact/active', { auth: false });
		return mapAgencyContact(dto);
	} catch (error) {
		// El backend responde 404 cuando todavía no se configuró ningún dato
		// de contacto (mismo contrato que getActiveExchangeRate).
		if (error instanceof ApiError && error.status === 404) return null;
		throw error;
	}
};

export const updateAgencyContact = async (
	whatsappPhone: string,
	adminId?: string | null
): Promise<void> => {
	await apiFetch('/api/agencyContact', {
		method: 'POST',
		body: { whatsappPhone, creadoPorAdminId: adminId ?? null },
	});
};
