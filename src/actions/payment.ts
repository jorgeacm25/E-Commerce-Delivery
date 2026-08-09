import {
	PaymentProofWithOrder,
	ReviewPaymentProofInput,
	UploadPaymentProofInput,
} from '../interfaces';
import { supabase } from '../supabase/client';
import { apiFetch, ApiError } from '../api/client';
import { ExchangeRateResultDto } from '../api/types';

const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
// El bucket es privado: se guarda el PATH interno en `imagen_url` y se
// genera una URL firmada al momento de mostrarla (ver getPaymentProofSignedUrl).
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60; // 1 hora

/* ********************************** */
/*         CUENTAS DE COBRO           */
/* ********************************** */

// Devuelve la cuenta activa de mayor prioridad para mostrar en el checkout
export const getActivePaymentAccount = async () => {
	const { data, error } = await supabase
		.from('payment_accounts')
		.select('*')
		.eq('activa', true)
		.order('prioridad', { ascending: true })
		.limit(1)
		.maybeSingle();

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return data;
};

export const getAllPaymentAccounts = async () => {
	const { data, error } = await supabase
		.from('payment_accounts')
		.select('*')
		.order('prioridad', { ascending: true });

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return data;
};

export const setPaymentAccountActiva = async (
	id: string,
	activa: boolean
) => {
	const { error } = await supabase
		.from('payment_accounts')
		.update({ activa })
		.eq('id', id);

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}
};

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

/* ********************************** */
/*       COMPROBANTES DE PAGO         */
/* ********************************** */

// Sube la imagen del comprobante y registra el comprobante ligado a la orden.
// El pago puede subirse antes o después de la entrega: no depende del estado logístico.
export const uploadPaymentProof = async ({
	orderId,
	paymentAccountId,
	file,
}: UploadPaymentProofInput) => {
	const path = `${orderId}/${Date.now()}-${file.name}`;

	const { data: uploadData, error: uploadError } = await supabase.storage
		.from(PAYMENT_PROOFS_BUCKET)
		.upload(path, file);

	if (uploadError) {
		console.log(uploadError);
		throw new Error(uploadError.message);
	}

	const { data: proof, error: proofError } = await supabase
		.from('payment_proofs')
		.insert({
			order_id: orderId,
			payment_account_id: paymentAccountId,
			imagen_url: uploadData.path,
			estado: 'pendiente',
		})
		.select()
		.single();

	if (proofError) {
		console.log(proofError);
		throw new Error(proofError.message);
	}

	// El pedido pasa a "comprobante subido", a la espera de que un operador lo confirme
	const { error: orderError } = await supabase
		.from('orders')
		.update({ payment_status: 'proof_uploaded' })
		.eq('id', orderId);

	if (orderError) {
		console.log(orderError);
		throw new Error(orderError.message);
	}

	return proof;
};

// Genera una URL temporal para mostrar la imagen del comprobante (bucket privado)
export const getPaymentProofSignedUrl = async (path: string) => {
	const { data, error } = await supabase.storage
		.from(PAYMENT_PROOFS_BUCKET)
		.createSignedUrl(path, SIGNED_URL_EXPIRES_IN_SECONDS);

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	return data.signedUrl;
};

/* ********************************** */
/*    VERIFICACIÓN (ADMINISTRADOR)    */
/* ********************************** */

// Cola de comprobantes pendientes de revisión, con datos de la orden y del cliente
export const getPendingPaymentProofs = async () => {
	const { data, error } = await supabase
		.from('payment_proofs')
		.select(
			`*,
			orders(id, total_amount, total_cup, currency, customers(full_name, email)),
			payment_accounts(tipo, titular, referencia)`
		)
		.eq('estado', 'pendiente')
		.order('created_at', { ascending: true });

	if (error) {
		console.log(error);
		throw new Error(error.message);
	}

	// supabase-js tipa columnas de texto como `string`; acá las acotamos
	// a los literales reales que ya garantizan el CHECK constraint en la DB.
	return data as unknown as PaymentProofWithOrder[];
};

export const confirmPaymentProof = async ({
	proofId,
	nota,
}: ReviewPaymentProofInput) => {
	const { data: userData, error: userError } =
		await supabase.auth.getUser();

	if (userError) {
		console.log(userError);
		throw new Error(userError.message);
	}

	const { data: proof, error: proofError } = await supabase
		.from('payment_proofs')
		.update({
			estado: 'confirmado',
			operador_id: userData.user.id,
			nota_operador: nota ?? null,
			reviewed_at: new Date().toISOString(),
		})
		.eq('id', proofId)
		.select()
		.single();

	if (proofError) {
		console.log(proofError);
		throw new Error(proofError.message);
	}

	const { error: orderError } = await supabase
		.from('orders')
		.update({ payment_status: 'confirmed' })
		.eq('id', proof.order_id);

	if (orderError) {
		console.log(orderError);
		throw new Error(orderError.message);
	}

	return proof;
};

export const rejectPaymentProof = async ({
	proofId,
	nota,
}: ReviewPaymentProofInput) => {
	const { data: userData, error: userError } =
		await supabase.auth.getUser();

	if (userError) {
		console.log(userError);
		throw new Error(userError.message);
	}

	const { data: proof, error: proofError } = await supabase
		.from('payment_proofs')
		.update({
			estado: 'rechazado',
			operador_id: userData.user.id,
			nota_operador: nota ?? null,
			reviewed_at: new Date().toISOString(),
		})
		.eq('id', proofId)
		.select()
		.single();

	if (proofError) {
		console.log(proofError);
		throw new Error(proofError.message);
	}

	// El pedido vuelve a "pending" de pago para que el cliente pueda reenviar comprobante
	const { error: orderError } = await supabase
		.from('orders')
		.update({ payment_status: 'rejected' })
		.eq('id', proof.order_id);

	if (orderError) {
		console.log(orderError);
		throw new Error(orderError.message);
	}

	return proof;
};
