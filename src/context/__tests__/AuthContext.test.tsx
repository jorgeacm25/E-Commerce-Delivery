import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/auth/useAuth';
import * as authApi from '../../api/auth';
import type { AuthSession } from '../../api/auth';
import { Profile } from '../../interfaces';

vi.mock('../../api/auth', () => ({
	getStoredSession: vi.fn(),
	getCustomerProfile: vi.fn(),
	getStaffProfile: vi.fn(),
	customerSignIn: vi.fn(),
	staffSignIn: vi.fn(),
	customerSignUp: vi.fn(),
	signOut: vi.fn(),
	requestPasswordReset: vi.fn(),
	resetPassword: vi.fn(),
	updateOwnPassword: vi.fn(),
}));

vi.mock('../../api/client', () => ({
	getToken: vi.fn(() => 'fake-token'),
	setToken: vi.fn(),
	clearToken: vi.fn(),
}));

const fakeSession: AuthSession = {
	token: 'fake-token',
	user: { id: 'user-1', email: 'ana@example.com' },
	role: 'customer',
};

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

	it('expone sesión nula si no hay token guardado válido', async () => {
		vi.mocked(authApi.getStoredSession).mockReturnValue(null);

		renderWithProviders();

		await waitFor(() => expect(screen.getByText('sesión: ninguna')).toBeInTheDocument());
		expect(screen.getByText('perfil: sin perfil')).toBeInTheDocument();
	});

	it('sincroniza el perfil cuando hay una sesión activa', async () => {
		vi.mocked(authApi.getStoredSession).mockReturnValue(fakeSession);
		vi.mocked(authApi.getCustomerProfile).mockResolvedValue(fakeProfile);

		renderWithProviders();

		await waitFor(() => expect(screen.getByText('sesión: user-1')).toBeInTheDocument());
		await waitFor(() => expect(screen.getByText('perfil: Ana Pérez')).toBeInTheDocument());
		expect(authApi.getCustomerProfile).toHaveBeenCalledWith('user-1');
	});

	it('useAuth lanza un error si se usa fuera de AuthProvider', () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		expect(() => render(<TestConsumer />)).toThrow(
			'useAuth debe usarse dentro de un <AuthProvider>'
		);

		consoleError.mockRestore();
	});
});
