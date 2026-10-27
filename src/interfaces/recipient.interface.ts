// Destinatario en Cuba guardado por el cliente, contra el backend .NET real
// (api/customerRecipient).
export interface CustomerRecipient {
	id: string;
	customerId: string;
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
