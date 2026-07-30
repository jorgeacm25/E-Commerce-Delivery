import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { Profile, SignInInput, SignUpInput, SignUpResult } from '../interfaces';
import * as authService from '../services/auth.service';

export interface AuthContextValue {
	session: Session | null;
	user: User | null;
	profile: Profile | null;
	// true solo mientras se resuelve la sesión inicial (storage/cookie), no
	// en cada cambio posterior. Sirve para la pantalla de carga de arranque.
	isInitializing: boolean;
	isProfileLoading: boolean;
	signUp: (input: SignUpInput) => Promise<SignUpResult>;
	signIn: (input: SignInInput) => Promise<Session>;
	signOut: () => Promise<void>;
	requestPasswordReset: (email: string) => Promise<void>;
	updatePassword: (password: string) => Promise<void>;
	refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface Props {
	children: React.ReactNode;
}

// Fuente única de verdad para la sesión de Supabase Auth en toda la app.
// Persistencia y renovación automática de sesión ya las resuelve el SDK de
// Supabase (createClient con las opciones por defecto: persistSession y
// autoRefreshToken en true); este provider solo mantiene el estado de React
// sincronizado con esos eventos vía onAuthStateChange y sincroniza el
// perfil (`profiles`) asociado al usuario autenticado.
export const AuthProvider = ({ children }: Props) => {
	const [session, setSession] = useState<Session | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const queryClient = useQueryClient();

	useEffect(() => {
		let isMounted = true;

		authService
			.getCurrentSession()
			.then(currentSession => {
				if (!isMounted) return;
				setSession(currentSession);
			})
			.finally(() => {
				if (isMounted) setIsInitializing(false);
			});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
			setIsInitializing(false);
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, []);

	const userId = session?.user.id;

	const { data: profile, isLoading: isProfileLoading } = useQuery({
		queryKey: ['profile', userId],
		queryFn: () => authService.getProfile(userId as string),
		enabled: Boolean(userId),
		retry: false,
	});

	const signUp = useCallback((input: SignUpInput) => authService.signUp(input), []);

	const signIn = useCallback((input: SignInInput) => authService.signIn(input), []);

	const signOut = useCallback(async () => {
		await authService.signOut();
		queryClient.removeQueries({ queryKey: ['profile'] });
	}, [queryClient]);

	const requestPasswordReset = useCallback(
		(email: string) => authService.requestPasswordReset(email),
		[]
	);

	const updatePassword = useCallback(
		(password: string) => authService.updatePassword(password),
		[]
	);

	const refreshSession = useCallback(async () => {
		const refreshed = await authService.refreshSession();
		setSession(refreshed);
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			session,
			user: session?.user ?? null,
			profile: profile ?? null,
			isInitializing,
			isProfileLoading,
			signUp,
			signIn,
			signOut,
			requestPasswordReset,
			updatePassword,
			refreshSession,
		}),
		[
			session,
			profile,
			isInitializing,
			isProfileLoading,
			signUp,
			signIn,
			signOut,
			requestPasswordReset,
			updatePassword,
			refreshSession,
		]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
