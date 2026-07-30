// Perfil sincronizado desde la tabla `profiles` (ver
// supabase/migrations/003_profiles.sql). Independiente de las tablas legacy
// `customers`/`user_roles` del dominio "celulares".
export interface Profile {
	id: string;
	fullName: string;
	phone: string | null;
	role: 'customer' | 'admin' | 'operador' | 'mensajero';
	status: 'active' | 'suspended';
	createdAt: string;
	updatedAt: string;
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
	// true cuando Supabase requiere confirmación de correo antes de habilitar
	// la sesión (signUp no devuelve `session` en ese caso).
	needsEmailConfirmation: boolean;
}
