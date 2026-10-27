import { apiFetch, ApiError } from '../api/client';
import { ExchangeRateResultDto } from '../api/types';

/* ********************************** */
/*           TASA DE CAMBIO           */
/* ********************************** */

// Migrado al backend .NET real (api/exchangeRate) — antes vivía en
// Supabase y dependía de `supabase.auth.getUser()`, que dejó de funcionar
// cuando la autenticación se movió por completo a .NET (no queda sesión de
// Supabase activa). Se mantiene la misma forma de retorno (snake_case) para
// no tocar los consumidores existentes (PricingModeFields, ExchangeRateWidget,
// AdminSettingsPage, useAdminDashboardStats).
interface ExchangeRateLegacyShape {
	id: string;
	valor_cup_por_usd: number;
	vigente_desde: string;
	creado_por: string | null;
}

const mapExchangeRate = (dto: ExchangeRateResultDto): ExchangeRateLegacyShape => ({
	id: dto.id ?? '',
	valor_cup_por_usd: dto.valorCupPorUsd ?? 0,
	vigente_desde: dto.vigenteDesde ?? '',
	creado_por: dto.creadoPorAdminId,
});

export const getActiveExchangeRate = async (): Promise<ExchangeRateLegacyShape | null> => {
	try {
		const dto = await apiFetch<ExchangeRateResultDto>('/api/exchangeRate/active', { auth: false });
		return mapExchangeRate(dto);
	} catch (error) {
		// El backend responde 404 cuando todavía no hay ninguna tasa
		// registrada (no un array/objeto vacío) — se traduce a null, mismo
		// contrato que el `.maybeSingle()` de Supabase que reemplaza.
		if (error instanceof ApiError && error.status === 404) return null;
		throw error;
	}
};

export const createExchangeRate = async (
	valorCupPorUsd: number,
	adminId?: string | null
): Promise<ExchangeRateLegacyShape> => {
	const dto = await apiFetch<ExchangeRateResultDto>('/api/exchangeRate', {
		method: 'POST',
		body: { valorCupPorUsd, creadoPorAdminId: adminId ?? null },
	});

	return mapExchangeRate(dto);
};

// Los comprobantes de pago (subida y verificación) se movieron a
// src/services/paymentProofs.service.ts, contra el backend .NET real
// (api/paymentProof) — las funciones que vivían acá contra Supabase
// (uploadPaymentProof, confirmPaymentProof, rejectPaymentProof,
// getPendingPaymentProofs) dependían de `supabase.auth.getUser()`, que
// dejó de devolver sesión cuando el login se movió por completo a .NET.
