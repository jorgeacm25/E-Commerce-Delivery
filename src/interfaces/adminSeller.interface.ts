// Fase E del roadmap (Vendedores y comisiones), contra el backend .NET real
// (api/seller, api/commission). La comisión se genera sola en el backend
// cuando un pedido con SellerId asignado llega a "Delivered" — este módulo
// solo lee y liquida.
export interface AdminSeller {
	id: string;
	fullName: string;
	phone: string;
	commissionPercentage: number;
	active: boolean;
	pendingCommissionUsd: number;
	createdAt: string;
}

export interface AdminSellerInput {
	fullName: string;
	phone: string;
	commissionPercentage: number;
}

export interface AdminSellerUpdateInput {
	fullName?: string;
	phone?: string;
	commissionPercentage?: number;
	active?: boolean;
}

export interface AdminCommission {
	id: string;
	sellerId: string;
	orderId: string;
	amountUsd: number;
	status: 'Pending' | 'Settled' | string;
	settledAt: string | null;
	createdAt: string;
}
