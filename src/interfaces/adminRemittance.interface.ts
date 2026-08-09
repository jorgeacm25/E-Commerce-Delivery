// Fase G del roadmap (Remesas), contra el backend .NET real
// (api/remittance).
export type AdminRemittanceStatus = 'Pending' | 'Sent' | 'Delivered';

export interface AdminRemittance {
	id: string;
	customerId: string | null;
	recipientName: string;
	amountUsd: number;
	amountCup: number;
	status: AdminRemittanceStatus | string;
	notes: string | null;
	createdAt: string;
}

export interface AdminRemittanceInput {
	recipientName: string;
	amountUsd: number;
	amountCup: number;
	notes?: string;
}
