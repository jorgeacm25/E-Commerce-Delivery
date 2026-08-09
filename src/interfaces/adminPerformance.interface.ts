// "Rendimiento" — módulo nuevo fuera del roadmap original (a pedido del
// usuario), 100% agregación en el cliente sobre datos ya reales
// (api/order, api/seller, api/commission). Sin entidad backend nueva.
export interface TopProduct {
	productId: string;
	productName: string;
	quantitySold: number;
	revenueUsd: number;
}

export interface SellerPerformance {
	sellerId: string;
	fullName: string;
	totalCommissionUsd: number;
	pendingCommissionUsd: number;
	settledCommissionUsd: number;
}

export interface PerformanceSummary {
	totalSalesUsd: number;
	totalOrders: number;
	avgTicketUsd: number;
	topProducts: TopProduct[];
	sellerPerformance: SellerPerformance[];
}
