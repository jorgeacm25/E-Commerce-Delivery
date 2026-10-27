// Caso de soporte creado por el cliente, contra el backend .NET real
// (api/supportCase). El cliente crea y lee sus casos; el cambio de
// `status` es de staff (PUT /api/supportCase/{id}/status) — no hay UI de
// edición para el cliente todavía, solo crear/ver.
export type SupportCaseCategory = 'pedido' | 'pago' | 'entrega' | 'producto' | 'otro';
export type SupportCaseStatus = 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';

export interface SupportCase {
	id: string;
	customerId: string;
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
