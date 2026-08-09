// Fase D del roadmap (Clientes), contra el backend .NET real (api/customer
// + api/order). La deuda se deriva client-side: no hay un campo "deuda" en
// el backend, se suman los pedidos en estado "Pending" (pagado pendiente)
// de cada cliente.
export interface AdminCustomer {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	status: string;
	ordersCount: number;
	pendingDebtUsd: number;
	createdAt: string;
}
