// Fase F del roadmap (Trabajadores/reparto), contra el backend .NET real
// (api/worker). A diferencia de Vendedores, el pago pendiente se acumula
// manualmente por staff (no hay todavía un vínculo automático a pedidos
// entregados) y se liquida (resetea a 0) con settleWorker.
export interface AdminWorker {
	id: string;
	fullName: string;
	role: string;
	active: boolean;
	pendingAmountUsd: number;
	createdAt: string;
}

export interface AdminWorkerInput {
	fullName: string;
	role: string;
	pendingAmountUsd: number;
}

export interface AdminWorkerUpdateInput {
	fullName?: string;
	role?: string;
	pendingAmountUsd?: number;
	active?: boolean;
}
