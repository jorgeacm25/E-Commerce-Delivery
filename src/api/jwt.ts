// Decodificador de JWT sin verificar firma — solo para leer claims en el
// cliente (la verificación real de firma/expiración la hace el backend en
// cada request vía [Authorize]; esto es puramente para UX: saber quién es
// el usuario y si el token ya expiró antes de intentar usarlo).
export const decodeJwt = <T>(token: string): T | null => {
	try {
		const payload = token.split('.')[1];
		if (!payload) return null;

		const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
		const json = decodeURIComponent(
			atob(padded)
				.split('')
				.map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
				.join('')
		);

		return JSON.parse(json) as T;
	} catch {
		return null;
	}
};

export const isJwtExpired = (exp: number): boolean => Date.now() >= exp * 1000;
