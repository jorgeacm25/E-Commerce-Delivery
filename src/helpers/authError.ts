// Traduce los mensajes de error más comunes de Supabase Auth al español.
// Los mensajes no listados caen a un genérico en vez de mostrar texto en
// inglés o detalles internos al usuario final.
const knownAuthErrorMessages: Record<string, string> = {
	'Invalid login credentials': 'Correo o contraseña incorrectos.',
	'Email not confirmed': 'Debes confirmar tu correo electrónico antes de iniciar sesión.',
	'User already registered': 'Ya existe una cuenta registrada con este correo.',
	'A user with this email address has already been registered':
		'Ya existe una cuenta registrada con este correo.',
	'Password should be at least 6 characters':
		'La contraseña debe tener al menos 6 caracteres.',
	'Email rate limit exceeded':
		'Se enviaron demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.',
	'For security purposes, you can only request this after 60 seconds':
		'Por seguridad, espera unos segundos antes de volver a intentarlo.',
	'New password should be different from the old password':
		'La nueva contraseña debe ser diferente a la anterior.',
	'Auth session missing!':
		'El enlace expiró o no es válido. Solicita uno nuevo.',
};

export const getAuthErrorMessage = (error: unknown): string => {
	const message = error instanceof Error ? error.message : String(error);

	return knownAuthErrorMessages[message] ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};
