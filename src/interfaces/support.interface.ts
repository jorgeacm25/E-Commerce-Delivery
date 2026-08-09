// Caso de soporte creado por el cliente (tabla `support_cases`, ver
// supabase/migrations/005_customer_account.sql). El cliente crea y lee sus
// casos; el cambio de `status` está protegido a nivel de base de datos
// (solo un admin puede modificarlo, ver el trigger
// protect_support_case_status en la migración) — no hay UI de edición
// todavía, solo crear/ver.
export type SupportCaseCategory = 'pedido' | 'pago' | 'entrega' | 'producto' | 'otro';
export type SupportCaseStatus = 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';

export interface SupportCase {
	id: string;
	profileId: string;
	category: SupportCaseCategory;
	subject: string;
	message: string;
	orderReference: string | null;
	status: SupportCaseStatus;
	createdAt: string;
	updatedAt: string;
}

export interface SupportCaseInput {
	category: SupportCaseCategory;
	subject: string;
	message: string;
	orderReference?: string;
}
