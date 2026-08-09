// Dirección guardada por el cliente (tabla `customer_addresses`, ver
// supabase/migrations/005_customer_account.sql). Independiente de la tabla
// legacy `addresses` del dominio "celulares" (ligada a `customers`, no a
// `profiles`).
export interface CustomerAddress {
	id: string;
	profileId: string;
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
