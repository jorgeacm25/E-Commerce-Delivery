import type { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/auth/useAuth';
import * as authService from '../../services/auth.service';
import { Profile } from '../../interfaces';

vi.mock('../../services/auth.service', () => ({
	getCurrentSession: vi.fn(),
	getProfile: vi.fn(),
	signIn: vi.fn(),
	signUp: vi.fn(),
	signOut: vi.fn(),
	requestPasswordReset: vi.fn(),
	updatePassword: vi.fn(),
	refreshSession: vi.fn(),
}));

vi.mock('../../supabase/client', () => ({
	supabase: {
		auth: {
			onAuthStateChange: vi.fn(() => ({
				data: { subscription: { unsubscribe: vi.fn() } },
			})),
		},
	},
}));

const fakeSession = {
	user: { id: 'user-1', email: 'ana@example.com' },
} as unknown as Session;

const fakeProfile: Profile = {
	id: 'user-1',
	fullName: 'Ana Pérez',
	phone: null,
	role: 'customer',
	status: 'active',
	createdAt: '2026-01-01T00:00:00.000Z',
	updatedAt: '2026-01-01T00:00:00.000Z',
};

const TestConsumer = () => {
	const { session, isInitializing, profile } = useAuth();

	if (isInitializing) return <p>cargando</p>;

	return (
		<div>
			<p>sesión: {session ? session.user.id : 'ninguna'}</p>
			<p>perfil: {profile ? profile.fullName : 'sin perfil'}</p>
		</div>
	);
};

const renderWithProviders = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<TestConsumer />
			</AuthProvider>
		</QueryClientProvider>
	);
};

describe('AuthProvider / useAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('inicia con isInitializing y luego expone sesión nula si no hay sesión activa', async () => {
		vi.mocked(authService.getCurrentSession).mockResolvedValue(null);

		renderWithProviders();

		expect(screen.getByText('cargando')).toBeInTheDocument();
		await waitFor(() => expect(screen.getByText('sesión: ninguna')).toBeInTheDocument());
		expect(screen.getByText('perfil: sin perfil')).toBeInTheDocument();
	});

	it('sincroniza el perfil cuando hay una sesión activa', async () => {
		vi.mocked(authService.getCurrentSession).mockResolvedValue(fakeSession);
		vi.mocked(authService.getProfile).mockResolvedValue(fakeProfile);

		renderWithProviders();

		await waitFor(() => expect(screen.getByText('sesión: user-1')).toBeInTheDocument());
		await waitFor(() => expect(screen.getByText('perfil: Ana Pérez')).toBeInTheDocument());
		expect(authService.getProfile).toHaveBeenCalledWith('user-1');
	});

	it('useAuth lanza un error si se usa fuera de AuthProvider', () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		expect(() => render(<TestConsumer />)).toThrow(
			'useAuth debe usarse dentro de un <AuthProvider>'
		);

		consoleError.mockRestore();
	});
});
