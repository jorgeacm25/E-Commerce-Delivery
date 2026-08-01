import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireAuth } from '../RequireAuth';
import { useAuth } from '../../hooks';
import { AuthContextValue } from '../../context/AuthContext';
import type { AuthSession } from '../../api/auth';

vi.mock('../../hooks', () => ({
	useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const mockAuth = (overrides: Partial<AuthContextValue>) =>
	useAuthMock.mockReturnValue({
		session: null,
		user: null,
		profile: null,
		isInitializing: false,
		isProfileLoading: false,
		signUp: vi.fn(),
		signIn: vi.fn(),
		staffSignIn: vi.fn(),
		signOut: vi.fn(),
		requestPasswordReset: vi.fn(),
		resetPassword: vi.fn(),
		updatePassword: vi.fn(),
		...overrides,
	});

const fakeSession: AuthSession = {
	token: 'fake-token',
	user: { id: 'user-1', email: null },
	role: 'customer',
};

const renderProtectedRoute = () =>
	render(
		<MemoryRouter initialEntries={['/mi-cuenta/pedidos']}>
			<Routes>
				<Route
					path='/mi-cuenta/pedidos'
					element={
						<RequireAuth>
							<p>Contenido protegido</p>
						</RequireAuth>
					}
				/>
				<Route path='/iniciar-sesion' element={<p>Página de login</p>} />
			</Routes>
		</MemoryRouter>
	);

const renderAdminRoute = () =>
	render(
		<MemoryRouter initialEntries={['/admin']}>
			<Routes>
				<Route
					path='/admin'
					element={
						<RequireAuth allowedRoles={['staff']}>
							<p>Contenido protegido</p>
						</RequireAuth>
					}
				/>
				<Route path='/iniciar-sesion' element={<p>Página de login</p>} />
				<Route path='/' element={<p>Página de inicio</p>} />
			</Routes>
		</MemoryRouter>
	);

describe('RequireAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('no muestra el contenido protegido mientras se inicializa la sesión', () => {
		mockAuth({ isInitializing: true });

		renderProtectedRoute();

		expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
		expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
	});

	it('redirige a iniciar sesión cuando no hay sesión activa', () => {
		mockAuth({ session: null, isInitializing: false });

		renderProtectedRoute();

		expect(screen.getByText('Página de login')).toBeInTheDocument();
		expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
	});

	it('renderiza el contenido protegido cuando hay una sesión activa', () => {
		mockAuth({
			session: fakeSession,
			isInitializing: false,
		});

		renderProtectedRoute();

		expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
	});

	describe('allowedRoles', () => {
		it('mientras se carga el perfil, no decide el acceso', () => {
			mockAuth({
				session: fakeSession,
				isInitializing: false,
				isProfileLoading: true,
			});

			renderAdminRoute();

			expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
			expect(screen.queryByText('Página de inicio')).not.toBeInTheDocument();
		});

		it('redirige a inicio cuando el rol del perfil no está permitido', () => {
			mockAuth({
				session: fakeSession,
				profile: { role: 'customer' } as AuthContextValue['profile'],
				isInitializing: false,
				isProfileLoading: false,
			});

			renderAdminRoute();

			expect(screen.getByText('Página de inicio')).toBeInTheDocument();
			expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
		});

		it('renderiza el contenido cuando el rol del perfil está permitido', () => {
			mockAuth({
				session: fakeSession,
				profile: { role: 'staff' } as AuthContextValue['profile'],
				isInitializing: false,
				isProfileLoading: false,
			});

			renderAdminRoute();

			expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
		});
	});
});
