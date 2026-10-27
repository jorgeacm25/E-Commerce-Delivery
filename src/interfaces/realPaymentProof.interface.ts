// Comprobantes de pago reales, contra el backend .NET (api/paymentProof),
// en reemplazo del flujo Supabase (payment.interface.ts: PaymentProof,
// PaymentProofWithOrder) que dependía de una sesión de Supabase Auth que
// esta app ya no crea nunca (login 100% .NET) — ver
// docs/PROJECT_STATE.md. La imagen sigue subiéndose a Supabase Storage
// (bucket 'payment-proofs', ver supabase/migrations/009_payment_proofs_storage_anon.sql),
// pero el registro del comprobante y su revisión viven en el backend real,
// ligados al pedido real (api/order).
export type RealPaymentProofStatus = 'pendiente' | 'confirmado' | 'rechazado';

export interface RealPaymentProof {
	id: string;
	orderId: string;
	paymentAccountId: string | null;
	imagenUrl: string;
	estado: RealPaymentProofStatus;
	operadorId: string | null;
	notaOperador: string | null;
	createdAt: string | null;
	reviewedAt: string | null;
}

export interface CreatePaymentProofInput {
	orderId: string;
	paymentAccountId?: string | null;
	file: File;
}

export interface ReviewPaymentProofInput {
	proofId: string;
	operadorId: string;
	estado: 'confirmado' | 'rechazado';
	nota?: string;
}
