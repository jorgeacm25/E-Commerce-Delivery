export type PaymentAccountType = 'zelle' | 'paypal';
export type PaymentProofStatus = 'pendiente' | 'confirmado' | 'rechazado';
export type OrderPaymentStatus =
	| 'pending'
	| 'proof_uploaded'
	| 'confirmed'
	| 'rejected';

export interface PaymentAccount {
	id: string;
	tipo: PaymentAccountType;
	titular: string;
	referencia: string;
	activa: boolean;
	prioridad: number;
	created_at: string;
}

export interface PaymentAccountInput {
	tipo: PaymentAccountType;
	titular: string;
	referencia: string;
	prioridad?: number;
}

export interface PaymentProof {
	id: string;
	order_id: number;
	payment_account_id: string | null;
	imagen_url: string;
	estado: PaymentProofStatus;
	operador_id: string | null;
	nota_operador: string | null;
	created_at: string;
	reviewed_at: string | null;
}

export interface PaymentProofWithOrder extends PaymentProof {
	orders: {
		id: number;
		total_amount: number;
		total_cup: number | null;
		currency: string;
		customers: {
			full_name: string;
			email: string;
		} | null;
	} | null;
	payment_accounts: {
		tipo: PaymentAccountType;
		titular: string;
		referencia: string;
	} | null;
}

export interface UploadPaymentProofInput {
	orderId: number;
	paymentAccountId: string;
	file: File;
}

export interface ReviewPaymentProofInput {
	proofId: string;
	nota?: string;
}

export interface ExchangeRate {
	id: string;
	valor_cup_por_usd: number;
	vigente_desde: string;
	creado_por: string | null;
}
