import { apiFetch } from '../api/client';
import { PaymentProofResultDto } from '../api/types';
import { CreatePaymentProofInput, RealPaymentProof, ReviewPaymentProofInput } from '../interfaces';
import { uploadFile } from './files.service';

// Comprobantes de pago reales, contra el backend .NET (api/paymentProof).
// La imagen se sube al backend real (api/files/upload, ver
// files.service.ts) — ya no depende de Supabase para nada. El archivo
// queda público (servido como estático), así que `imagenUrl` ya es una URL
// usable directamente, sin necesidad de firmar nada.
const mapProof = (dto: PaymentProofResultDto): RealPaymentProof => ({
	id: dto.id ?? '',
	orderId: dto.orderId ?? '',
	paymentAccountId: dto.paymentAccountId,
	imagenUrl: dto.imagenUrl ?? '',
	estado: (dto.estado as RealPaymentProof['estado']) ?? 'pendiente',
	operadorId: dto.operadorId,
	notaOperador: dto.notaOperador,
	createdAt: dto.createdAt,
	reviewedAt: dto.reviewedAt,
});

export const createPaymentProof = async ({
	orderId,
	paymentAccountId,
	file,
}: CreatePaymentProofInput): Promise<RealPaymentProof> => {
	const imagenUrl = await uploadFile(file, 'payment-proofs');

	const dto = await apiFetch<PaymentProofResultDto>('/api/paymentProof', {
		method: 'POST',
		body: { orderId, paymentAccountId: paymentAccountId ?? null, imagenUrl },
	});

	return mapProof(dto);
};

export const getPaymentProofs = async (): Promise<RealPaymentProof[]> => {
	const dtos = await apiFetch<PaymentProofResultDto[]>('/api/paymentProof');
	return dtos
		.map(mapProof)
		.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
};

export const reviewPaymentProof = async ({
	proofId,
	operadorId,
	estado,
	nota,
}: ReviewPaymentProofInput): Promise<void> => {
	await apiFetch(`/api/paymentProof/${proofId}/review`, {
		method: 'PUT',
		body: { operadorId, estado, nota: nota ?? null },
	});
};
