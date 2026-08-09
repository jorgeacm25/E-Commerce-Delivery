// Capa de autenticación contra el backend .NET (Almacen-Delivery-Home_Api_new),
// en reemplazo de src/services/auth.service.ts (Supabase Auth). El backend
// tiene 3 logins separados con JWT propio, sin refresh token (expira a los
// 60 min, JwtSettings.AccessTokenExpirationMinutes):
//   - POST /api/customer/login   -> { token }              (clientes)
//   - POST /user/login           -> "token" (string pelado) (staff normal)
//   - POST /api/admin/login      -> "token" (string pelado) (staff raíz)
// El claim `tipo` del JWT distingue "customer" de todo lo demás (por un
// detalle del backend, tanto Admin como User emiten tipo="admin" — no hay
// forma de diferenciarlos solo con el token; no hace falta para la UX del
// frontend, que solo necesita saber cliente vs. staff).
import { apiFetch, setToken, clearToken, ApiError } from './client';
import { decodeJwt, isJwtExpired } from './jwt';
import type { Profile, SignInInput, SignUpInput, SignUpResult } from '../interfaces';

export interface AuthUser {
	id: string;
	email: string | null;
}

export interface AuthSession {
	token: string;
	user: AuthUser;
	role: 'customer' | 'staff';
}

interface JwtClaims {
	sub: string;
	unique_name: string;
	tipo: 'customer' | 'admin';
	permission?: string[];
	exp: number;
}

const sessionFromToken = (token: string): AuthSession => {
	const claims = decodeJwt<JwtClaims>(token);
	if (!claims) throw new Error('No se pudo leer la sesión.');

	return {
		token,
		user: {
			id: claims.sub,
			email: claims.tipo === 'customer' ? claims.unique_name : null,
		},
		role: claims.tipo === 'customer' ? 'customer' : 'staff',
	};
};

export const getStoredSession = (token: string | null): AuthSession | null => {
	if (!token) return null;

	const claims = decodeJwt<JwtClaims>(token);
	if (!claims || isJwtExpired(claims.exp)) return null;

	return sessionFromToken(token);
};

export const customerSignUp = async (input: SignUpInput): Promise<SignUpResult> => {
	await apiFetch('/api/customer/register', {
		method: 'POST',
		auth: false,
		body: {
			fullName: input.fullName,
			email: input.email,
			password: input.password,
			phone: input.phone,
		},
	});

	return { needsEmailConfirmation: false };
};

export const customerSignIn = async ({ email, password }: SignInInput): Promise<AuthSession> => {
	const { token } = await apiFetch<{ token: string }>('/api/customer/login', {
		method: 'POST',
		auth: false,
		body: { email, password },
	});

	const session = sessionFromToken(token);
	setToken(token);
	return session;
};

// Intenta login de staff normal (User) y, si no existe ese usuario, de
// staff raíz (Admin) — transparente para quien loguea, no necesita saber
// cuál de los dos es. Se llama desde src/pages/admin/AdminLoginPage.tsx.
export const staffSignIn = async ({ email, password }: SignInInput): Promise<AuthSession> => {
	let userError: unknown;

	try {
		const token = await apiFetch<string>('/user/login', {
			method: 'POST',
			auth: false,
			body: { userName: email, password },
		});
		const session = sessionFromToken(token);
		setToken(token);
		return session;
	} catch (error) {
		userError = error;
	}

	try {
		const token = await apiFetch<string>('/api/admin/login', {
			method: 'POST',
			auth: false,
			body: { userName: email, password },
		});
		const session = sessionFromToken(token);
		setToken(token);
		return session;
	} catch (adminError) {
		// Un 401/404 en /user/login es el disparador esperado del fallback (la
		// cuenta puede ser Admin, no User) — ahí el error de /api/admin/login
		// es más informativo. Si /user/login falló por otra razón (red, 5xx),
		// esa señal es más útil que la del segundo intento.
		if (userError instanceof ApiError && userError.status !== 401 && userError.status !== 404) {
			throw userError;
		}
		throw adminError;
	}
};

export const signOut = (): void => {
	clearToken();
};

export const requestPasswordReset = async (email: string): Promise<{ devResetToken?: string }> => {
	return apiFetch('/api/customer/forgot-password', {
		method: 'POST',
		auth: false,
		body: { email },
	});
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
	await apiFetch('/api/customer/reset-password', {
		method: 'POST',
		auth: false,
		body: { token, newPassword },
	});
};

// Mismo patrón de recuperación que el cliente, pero para staff (User). Ver
// AuthContext: se disparan ambos (cliente y staff) al pedir el reset, y se
// intenta con ambos al confirmarlo, ya que ni el backend ni el frontend
// saben de antemano si el username pertenece a un cliente o a staff.
export const staffRequestPasswordReset = async (
	userName: string
): Promise<{ devResetToken?: string }> => {
	return apiFetch('/user/forgot-password', {
		method: 'POST',
		auth: false,
		body: { userName },
	});
};

export const staffResetPassword = async (token: string, newPassword: string): Promise<void> => {
	await apiFetch('/user/reset-password', {
		method: 'POST',
		auth: false,
		body: { token, newPassword },
	});
};

// Cambio de contraseña estando ya logueado (distinto del flujo de reset por
// token). El propio cliente se actualiza a sí mismo vía PUT /api/customer.
export const updateOwnPassword = async (customerId: string, newPassword: string): Promise<void> => {
	await apiFetch('/api/customer', {
		method: 'PUT',
		body: { id: customerId, password: newPassword },
	});
};

interface CustomerResultDto {
	id: string | null;
	fullName: string | null;
	email: string | null;
	phone: string | null;
	status: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

interface UserResultDto {
	id: string | null;
	fullName: string | null;
	userName: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

interface AdminResultDto {
	id: string | null;
	userName: string | null;
	fullName: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export const getCustomerProfile = async (id: string): Promise<Profile> => {
	const dto = await apiFetch<CustomerResultDto>(`/api/customer/${id}`);

	return {
		id: dto.id ?? id,
		fullName: dto.fullName ?? '',
		phone: dto.phone,
		role: 'customer',
		status: (dto.status as Profile['status']) ?? 'active',
		createdAt: dto.createdAt,
		updatedAt: dto.updatedAt,
	};
};

export const getStaffProfile = async (id: string): Promise<Profile> => {
	try {
		const dto = await apiFetch<UserResultDto>(`/user/${id}`);

		return {
			id: dto.id ?? id,
			fullName: dto.fullName ?? '',
			phone: null,
			role: 'staff',
			status: 'active',
			createdAt: dto.createdAt,
			updatedAt: dto.updatedAt,
			accountType: 'user',
		};
	} catch (userError) {
		try {
			const dto = await apiFetch<AdminResultDto>(`/api/admin/${id}`);

			return {
				id: dto.id ?? id,
				fullName: dto.fullName ?? '',
				phone: null,
				role: 'staff',
				status: 'active',
				createdAt: dto.createdAt,
				updatedAt: dto.updatedAt,
				accountType: 'admin',
			};
		} catch {
			// Ni User ni Admin existen con este id — el error de /user/{id} es
			// el caso común y más representativo.
			throw userError;
		}
	}
};
