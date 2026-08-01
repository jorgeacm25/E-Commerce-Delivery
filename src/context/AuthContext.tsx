import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getToken, clearToken } from '../api/client';
import * as authApi from '../api/auth';
import type { AuthSession, AuthUser } from '../api/auth';
import { Profile, SignInInput, SignUpInput, SignUpResult } from '../interfaces';

export interface AuthContextValue {
	session: AuthSession | null;
	user: AuthUser | null;
	profile: Profile | null;
	// true solo mientras se resuelve la sesión inicial (token en
	// localStorage), no en cada cambio posterior. Sirve para la pantalla de
	// carga de arranque.
	isInitializing: boolean;
	isProfileLoading: boolean;
	signUp: (input: SignUpInput) => Promise<SignUpResult>;
	// Login de cliente. Ver staffSignIn para login de personal interno.
	signIn: (input: SignInInput) => Promise<AuthSession>;
	staffSignIn: (input: SignInInput) => Promise<AuthSession>;
	signOut: () => Promise<void>;
	requestPasswordReset: (email: string) => Promise<{ devResetToken?: string }>;
	resetPassword: (token: string, newPassword: string) => Promise<void>;
	// Cambio de contraseña estando ya logueado (Seguridad de la cuenta). No
	// confundir con resetPassword (flujo de "olvidé mi contraseña").
	updatePassword: (password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface Props {
	children: React.ReactNode;
}

// Fuente única de verdad para la sesión del backend .NET en toda la app.
// A diferencia de Supabase, no hay SDK que persista/renueve la sesión por
// nosotros: el JWT se guarda en localStorage (src/api/client.ts) y no tiene
// refresh token (expira a los 60 min — JwtSettings.AccessTokenExpirationMinutes
// del backend), así que al expirar simplemente se cierra la sesión y hay
// que volver a iniciar sesión.
export const AuthProvider = ({ children }: Props) => {
	const [session, setSession] = useState<AuthSession | null>(() => authApi.getStoredSession(getToken()));
	// Resolver la sesión inicial es síncrono (decodificar el JWT guardado en
	// localStorage, sin red) — a diferencia de Supabase, nunca hay una fase
	// de carga real acá. Se conserva el campo por compatibilidad con
	// consumidores existentes (PageSkeleton mientras arranca).
	const isInitializing = false;
	const queryClient = useQueryClient();

	// Verifica en cada montaje que el token guardado no haya expirado
	// mientras la pestaña estaba cerrada.
	useEffect(() => {
		const stored = authApi.getStoredSession(getToken());
		if (!stored) {
			clearToken();
			setSession(null);
		}
	}, []);

	const userId = session?.user.id;
	const role = session?.role;

	const { data: profile, isLoading: isProfileLoading } = useQuery({
		queryKey: ['profile', userId, role],
		queryFn: () =>
			role === 'staff' ? authApi.getStaffProfile(userId as string) : authApi.getCustomerProfile(userId as string),
		enabled: Boolean(userId && role),
		retry: false,
	});

	// A diferencia de Supabase, el registro no abre sesión por sí solo (el
	// backend .NET solo crea la cuenta) — se encadena el login con las
	// mismas credenciales para que el contrato siga siendo "needsEmailConfirmation:
	// false implica que ya quedaste logueado", como esperan los consumidores
	// existentes (ver RegisterPage.tsx).
	const signUp = useCallback(async (input: SignUpInput) => {
		const result = await authApi.customerSignUp(input);
		const newSession = await authApi.customerSignIn({ email: input.email, password: input.password });
		setSession(newSession);
		return result;
	}, []);

	const signIn = useCallback(async (input: SignInInput) => {
		const newSession = await authApi.customerSignIn(input);
		setSession(newSession);
		return newSession;
	}, []);

	const staffSignIn = useCallback(async (input: SignInInput) => {
		const newSession = await authApi.staffSignIn(input);
		setSession(newSession);
		return newSession;
	}, []);

	const signOut = useCallback(async () => {
		authApi.signOut();
		setSession(null);
		queryClient.removeQueries({ queryKey: ['profile'] });
	}, [queryClient]);

	const requestPasswordReset = useCallback((email: string) => authApi.requestPasswordReset(email), []);

	const resetPassword = useCallback(
		(token: string, newPassword: string) => authApi.resetPassword(token, newPassword),
		[]
	);

	const updatePassword = useCallback(
		async (password: string) => {
			if (!userId) throw new Error('No hay una sesión activa.');
			await authApi.updateOwnPassword(userId, password);
		},
		[userId]
	);

	const value = useMemo<AuthContextValue>(
		() => ({
			session,
			user: session?.user ?? null,
			profile: profile ?? null,
			isInitializing,
			isProfileLoading,
			signUp,
			signIn,
			staffSignIn,
			signOut,
			requestPasswordReset,
			resetPassword,
			updatePassword,
		}),
		[
			session,
			profile,
			isInitializing,
			isProfileLoading,
			signUp,
			signIn,
			staffSignIn,
			signOut,
			requestPasswordReset,
			resetPassword,
			updatePassword,
		]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
