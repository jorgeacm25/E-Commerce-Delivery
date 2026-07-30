import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { getAuthErrorMessage } from '../helpers/authError';
import { Profile, SignInInput, SignUpInput, SignUpResult } from '../interfaces';

type ProfileRow = {
	id: string;
	full_name: string;
	phone: string | null;
	role: string;
	status: string;
	created_at: string;
	updated_at: string;
};

const mapProfileRow = (row: ProfileRow): Profile => ({
	id: row.id,
	fullName: row.full_name,
	phone: row.phone,
	role: row.role as Profile['role'],
	status: row.status as Profile['status'],
	createdAt: row.created_at,
	updatedAt: row.updated_at,
});

export const signUp = async ({
	email,
	password,
	fullName,
	phone,
}: SignUpInput): Promise<SignUpResult> => {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: { full_name: fullName, phone: phone ?? null },
			emailRedirectTo: `${window.location.origin}/iniciar-sesion`,
		},
	});

	if (error) throw new Error(getAuthErrorMessage(error));

	// Si Supabase exige confirmación de correo, signUp devuelve el usuario
	// pero no una sesión activa: el registro queda pendiente hasta que el
	// enlace de confirmación se abra.
	return { needsEmailConfirmation: !data.session };
};

export const signIn = async ({ email, password }: SignInInput): Promise<Session> => {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) throw new Error(getAuthErrorMessage(error));
	if (!data.session) throw new Error(getAuthErrorMessage('Auth session missing!'));

	return data.session;
};

export const signOut = async (): Promise<void> => {
	const { error } = await supabase.auth.signOut();

	if (error) throw new Error(getAuthErrorMessage(error));
};

export const requestPasswordReset = async (email: string): Promise<void> => {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${window.location.origin}/restablecer-contrasena`,
	});

	if (error) throw new Error(getAuthErrorMessage(error));
};

export const updatePassword = async (password: string): Promise<void> => {
	const { error } = await supabase.auth.updateUser({ password });

	if (error) throw new Error(getAuthErrorMessage(error));
};

export const getCurrentSession = async (): Promise<Session | null> => {
	const { data, error } = await supabase.auth.getSession();

	if (error) throw new Error(getAuthErrorMessage(error));

	return data.session;
};

export const refreshSession = async (): Promise<Session | null> => {
	const { data, error } = await supabase.auth.refreshSession();

	if (error) throw new Error(getAuthErrorMessage(error));

	return data.session;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.maybeSingle();

	if (error) throw new Error('Error al obtener el perfil del usuario.');
	if (!data) return null;

	return mapProfileRow(data as ProfileRow);
};
