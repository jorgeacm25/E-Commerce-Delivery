import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../../hooks';
import { useGlobalStore } from '../../../store/global.store';

vi.mock('../../../hooks', () => ({
	useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const renderLoginRoute = (from?: string) =>
	render(
		<MemoryRouter
			initialEntries={[{ pathname: '/iniciar-sesion', state: from ? { from: { pathname: from } } : null }]}
		>
			<Routes>
				<Route path='/iniciar-sesion' element={<LoginPage />} />
				<Route path='/' element={<p>Inicio</p>} />
				<Route path='/mi-cuenta/pedidos' element={<p>Mis pedidos</p>} />
			</Routes>
		</MemoryRouter>
	);

// /iniciar-sesion ya no es una página: abre el modal de login (LoginModal)
describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useGlobalStore.setState({ isLoginModalOpen: false, loginRedirectTo: null });
	});

	it('abre el modal de login sobre la portada recordando la página de origen', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ session: null } as any);

		renderLoginRoute('/mi-cuenta/pedidos');

		expect(await screen.findByText('Inicio')).toBeInTheDocument();
		expect(useGlobalStore.getState().isLoginModalOpen).toBe(true);
		expect(useGlobalStore.getState().loginRedirectTo).toBe('/mi-cuenta/pedidos');
	});

	it('con sesión iniciada lleva a la página de origen sin abrir el modal', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ session: { user: { id: '1' } } } as any);

		renderLoginRoute('/mi-cuenta/pedidos');

		expect(await screen.findByText('Mis pedidos')).toBeInTheDocument();
		expect(useGlobalStore.getState().isLoginModalOpen).toBe(false);
	});
});
