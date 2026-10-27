// Dirección guardada por el cliente, contra el backend .NET real
// (api/customerAddress). Independiente de la tabla legacy `addresses` del
// dominio "celulares" (Supabase, ligada a `customers`).
export interface CustomerAddress {
	id: string;
	customerId: string;
	label: string | null;
	province: string;
	municipality: string;
	addressLine: string;
	referenceNotes: string | null;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CustomerAddressInput {
	label?: string;
	province: string;
	municipality: string;
	addressLine: string;
	referenceNotes?: string;
	isDefault?: boolean;
}
