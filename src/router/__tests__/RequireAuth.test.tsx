import type { Session } from '@supabase/supabase-js';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireAuth } from '../RequireAuth';
import { useAuth } from '../../hooks';
import { AuthContextValue } from '../../context/AuthContext';

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
		signOut: vi.fn(),
		requestPasswordReset: vi.fn(),
		updatePassword: vi.fn(),
		refreshSession: vi.fn(),
		...overrides,
	});

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
			session: { user: { id: 'user-1' } } as unknown as Session,
			isInitializing: false,
		});

		renderProtectedRoute();

		expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
	});
});
