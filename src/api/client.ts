// Cliente HTTP para el backend .NET (Almacen-Delivery-Home_Api_new), usado
// por src/api/auth.ts y src/context/AuthContext.tsx. Los actions/services
// del resto del dominio (productos, pedidos, direcciones, etc.) todavía
// hablan con Supabase directamente — migrarlos es trabajo aparte, más
// grande, fuera del alcance de la autenticación.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!API_BASE_URL) {
	console.warn(
		'VITE_API_BASE_URL no está configurado. Las llamadas al backend .NET fallarán hasta que se defina.'
	);
}

// El backend no tiene refresh token (JWT de 60 min, ver JwtSettings). Se
// guarda en memoria + localStorage para sobrevivir a un refresh de página;
// cuando expire, el usuario tendrá que volver a iniciar sesión (no hay
// renovación automática todavía).
const TOKEN_STORAGE_KEY = 'dh-api-token';

let currentToken: string | null =
	typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

export const getToken = (): string | null => currentToken;

export const setToken = (token: string): void => {
	currentToken = token;
	localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearToken = (): void => {
	currentToken = null;
	localStorage.removeItem(TOKEN_STORAGE_KEY);
};

let unauthorizedHandler: (() => void) | null = null;

// Registrado por AuthContext. Se dispara en cada 401 de una request
// autenticada (token vencido o inválido) — no en logins fallidos (ver el
// guard `auth` en apiFetch), porque ahí no hay sesión que haya expirado.
export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
	unauthorizedHandler = handler;
};

export class ApiError extends Error {
	status: number;
	body: unknown;

	constructor(status: number, message: string, body: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;
	}
}

// Extrae un mensaje legible del body de error. El backend no es
// consistente: algunos endpoints devuelven { error: "..." }, otros
// devuelven el objeto de error crudo (ver GenericController vs.
// controladores con StatusCode(..., new { error = ... })).
const extractErrorMessage = (body: unknown, fallback: string): string => {
	if (body && typeof body === 'object') {
		if ('error' in body) {
			const err = (body as { error: unknown }).error;
			if (typeof err === 'string') return err;
			if (err && typeof err === 'object' && 'message' in err) {
				const message = (err as { message: unknown }).message;
				if (typeof message === 'string') return message;
			}
		}
		if ('message' in body && typeof (body as { message: unknown }).message === 'string') {
			return (body as { message: string }).message;
		}
	}
	return fallback;
};

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
	body?: unknown;
	auth?: boolean; // default true: adjunta el JWT si existe
}

export const apiFetch = async <T>(path: string, options: ApiFetchOptions = {}): Promise<T> => {
	const { body, auth = true, headers, ...rest } = options;

	const finalHeaders: Record<string, string> = {
		Accept: 'application/json',
		...(headers as Record<string, string> | undefined),
	};

	if (body !== undefined) {
		finalHeaders['Content-Type'] = 'application/json';
	}

	if (auth && currentToken) {
		finalHeaders.Authorization = `Bearer ${currentToken}`;
	}

	const response = await fetch(`${API_BASE_URL ?? ''}${path}`, {
		...rest,
		headers: finalHeaders,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	// 204 No Content u otras respuestas sin body.
	const rawText = await response.text();
	const parsed: unknown = rawText ? JSON.parse(rawText) : null;

	if (!response.ok) {
		if (response.status === 401 && auth) {
			unauthorizedHandler?.();
		}

		throw new ApiError(
			response.status,
			extractErrorMessage(parsed, `Error ${response.status} al llamar a ${path}`),
			parsed
		);
	}

	return parsed as T;
};
