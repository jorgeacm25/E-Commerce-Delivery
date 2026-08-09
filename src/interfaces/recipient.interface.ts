// Destinatario en Cuba guardado por el cliente (tabla
// `customer_recipients`, ver supabase/migrations/005_customer_account.sql).
export interface CustomerRecipient {
	id: string;
	profileId: string;
	fullName: string;
	phone: string;
	nationalId: string | null;
	province: string;
	municipality: string;
	addressLine: string;
	notes: string | null;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CustomerRecipientInput {
	fullName: string;
	phone: string;
	nationalId?: string;
	province: string;
	municipality: string;
	addressLine: string;
	notes?: string;
	isDefault?: boolean;
}
