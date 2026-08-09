// Cuentas de cobro (Zelle/PayPal) del panel admin, contra el backend .NET
// real (api/paymentAccount). Prefijo `Admin` para no chocar con
// `PaymentAccount`/`PaymentAccountInput` (payment.interface.ts, legacy
// Supabase — todavía usado por el checkout público y la cola de
// verificación de comprobantes, fuera de alcance de esta migración). El
// backend no tiene endpoint de borrado — solo se puede activar/desactivar.
export interface AdminPaymentAccount {
	id: string;
	tipo: string;
	titular: string;
	referencia: string;
	activa: boolean;
	prioridad: number;
	createdAt: string;
}

export interface AdminPaymentAccountInput {
	tipo: string;
	titular: string;
	referencia: string;
	prioridad: number;
}

export interface AdminPaymentAccountUpdateInput {
	titular?: string;
	referencia?: string;
	prioridad?: number;
	activa?: boolean;
}
