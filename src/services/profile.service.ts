import { apiFetch } from '../api/client';

// Antes escribía directo a Supabase (`profiles`, RLS `auth.uid() = id`) —
// dejó de funcionar cuando el login se movió 100% al backend .NET (la app
// nunca vuelve a autenticarse contra Supabase, ver docs/PROJECT_STATE.md).
// `PUT /api/customer` no devuelve el perfil actualizado (Result<Unit>): el
// caller debe invalidar la query de perfil (ver useUpdateProfile.ts) para
// que AuthContext lo vuelva a traer de GET /api/customer/{id}.
export interface UpdateProfileInput {
	fullName: string;
	phone?: string;
}

export const updateProfile = async (id: string, input: UpdateProfileInput): Promise<void> => {
	await apiFetch('/api/customer', {
		method: 'PUT',
		body: { id, fullName: input.fullName, phone: input.phone ?? null },
	});
};
