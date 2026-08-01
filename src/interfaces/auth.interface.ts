// Perfil del usuario autenticado. El backend .NET (Almacen-Delivery-Home_Api_new)
// distingue 3 identidades reales — Customer, User (staff) y Admin (staff
// raíz, gestiona Users) — pero para efectos de UX/guardas de ruta en el
// frontend alcanza con distinguir 'customer' de 'staff'; qué tan
// específico es el permiso de un staff se resuelve en el backend, no acá.
export interface Profile {
	id: string;
	fullName: string;
	phone: string | null;
	role: 'customer' | 'staff';
	status: 'active' | 'suspended' | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface SignUpInput {
	email: string;
	password: string;
	fullName: string;
	phone?: string;
}

export interface SignInInput {
	email: string;
	password: string;
}

export interface SignUpResult {
	// Se mantiene por compatibilidad con los consumidores existentes; el
	// backend .NET no tiene confirmación de correo, siempre es false.
	needsEmailConfirmation: boolean;
}
