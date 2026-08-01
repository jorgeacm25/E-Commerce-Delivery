// El backend .NET (Almacen-Delivery-Home_Api_new) ya devuelve mensajes de
// error en español (ver AlmacenApi.Aplication.Common.Errors), extraídos por
// src/api/client.ts (ApiError.message) — a diferencia de Supabase Auth, no
// hace falta traducir un catálogo de mensajes en inglés.
export const getAuthErrorMessage = (error: unknown): string => {
	if (error instanceof Error && error.message) {
		return error.message;
	}

	return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};
