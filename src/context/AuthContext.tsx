import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getToken, clearToken, setUnauthorizedHandler } from '../api/client';
import * as authApi from '../api/auth';
import type { AuthSession, AuthUser } from '../api/auth';
import { Profile, SignInInput, SignUpInput, SignUpResult } from '../interfaces';
import { showErrorToast } from '../components/ui';

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

	// Se usa dentro del handler de 401 de más abajo para saber si hay sesión
	// sin recrear el efecto en cada cambio de `session`.
	const sessionRef = useRef(session);
	useEffect(() => {
		sessionRef.current = session;
	}, [session]);

	// El JWT no tiene refresh token: si expira a mitad de sesión, la próxima
	// request autenticada devuelve 401 (ver apiFetch en src/api/client.ts).
	// Antes eso fallaba en silencio en el hook/mutación que lo disparó; acá
	// se cierra la sesión centralizadamente para que RequireAuth redirija al
	// login correspondiente (cliente o admin, según el loginPath del layout).
	useEffect(() => {
		setUnauthorizedHandler(() => {
			if (!sessionRef.current) return;

			authApi.signOut();
			setSession(null);
			queryClient.removeQueries({ queryKey: ['profile'] });
			showErrorToast('Tu sesión expiró. Vuelve a iniciar sesión.');
		});

		return () => setUnauthorizedHandler(null);
	}, [queryClient]);

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

	// El backend no distingue "no existe esta cuenta" de "existe pero es de
	// staff" (por diseño, para no filtrar qué cuentas existen) — así que ni
	// esta función ni las páginas que la usan saben si el email/username es
	// de cliente o de staff. Se disparan ambos endpoints; el que corresponda
	// devuelve el devResetToken (en Development), el otro responde vacío.
	const requestPasswordReset = useCallback(async (email: string) => {
		const [customerResult, staffResult] = await Promise.allSettled([
			authApi.requestPasswordReset(email),
			authApi.staffRequestPasswordReset(email),
		]);

		const devResetToken =
			(customerResult.status === 'fulfilled' && customerResult.value.devResetToken) ||
			(staffResult.status === 'fulfilled' && staffResult.value.devResetToken) ||
			undefined;

		return { devResetToken };
	}, []);

	// Mismo patrón primario/fallback que staffSignIn/signIn en LoginPage: se
	// prueba primero como cliente y, si el token no es válido ahí, como staff.
	const resetPassword = useCallback(async (token: string, newPassword: string) => {
		try {
			await authApi.resetPassword(token, newPassword);
		} catch {
			await authApi.staffResetPassword(token, newPassword);
		}
	}, []);

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
