import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginModal } from '../LoginModal';
import { AccountLink } from '../../layout/AccountLink';
import { useAuth } from '../../../hooks';
import { useGlobalStore } from '../../../store/global.store';

vi.mock('../../../hooks', () => ({
	useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const mockAuth = (signIn = vi.fn()) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useAuthMock.mockReturnValue({ session: null, isInitializing: false, signIn } as any);
	return signIn;
};

const renderLoginModal = () =>
	render(
		<MemoryRouter initialEntries={['/']}>
			<AccountLink />
			<LoginModal />
			<Routes>
				<Route path='/' element={<p>Inicio</p>} />
				<Route path='/mi-cuenta/pedidos' element={<p>Mis pedidos</p>} />
			</Routes>
		</MemoryRouter>
	);

const openFromNavbar = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
	return screen.findByRole('dialog', { name: /bienvenido de nuevo/i });
};

describe('LoginModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useGlobalStore.setState({ isLoginModalOpen: false, loginRedirectTo: null });
	});

	it('se abre desde el botón de cuenta de la navbar', async () => {
		mockAuth();
		const user = userEvent.setup();

		renderLoginModal();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

		await openFromNavbar(user);
		expect(screen.getByLabelText(/correo electrónico/i)).toHaveFocus();
	});

	it('muestra errores de validación y no llama a signIn si los campos están vacíos', async () => {
		const signIn = mockAuth();
		const user = userEvent.setup();

		renderLoginModal();
		const dialog = await openFromNavbar(user);
		await user.click(screen.getAllByRole('button', { name: 'Iniciar sesión' }).find(b => dialog.contains(b))!);

		expect(await screen.findByText('El correo o usuario es requerido')).toBeInTheDocument();
		expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
		expect(signIn).not.toHaveBeenCalled();
	});

	it('inicia sesión, cierra el modal y lleva a la página de origen si la había', async () => {
		const signIn = mockAuth(vi.fn().mockResolvedValue({}));
		const user = userEvent.setup();

		renderLoginModal();
		useGlobalStore.getState().openLoginModal('/mi-cuenta/pedidos');
		const dialog = await screen.findByRole('dialog');

		await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
		await user.type(screen.getByLabelText(/^contraseña/i), 'secreto123');
		await user.click(screen.getAllByRole('button', { name: 'Iniciar sesión' }).find(b => dialog.contains(b))!);

		expect(signIn).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'secreto123' });
		expect(await screen.findByText('Mis pedidos')).toBeInTheDocument();
		await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
	});

	it('muestra el mensaje de error del backend cuando las credenciales son inválidas', async () => {
		// El backend .NET ya devuelve el mensaje en español (ver
		// CustomerPasswordMatchError) — se muestra tal cual.
		mockAuth(vi.fn().mockRejectedValue(new Error('La contraseña no es correcta')));
		const user = userEvent.setup();

		renderLoginModal();
		const dialog = await openFromNavbar(user);
		await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
		await user.type(screen.getByLabelText(/^contraseña/i), 'incorrecta');
		await user.click(screen.getAllByRole('button', { name: 'Iniciar sesión' }).find(b => dialog.contains(b))!);

		expect(await screen.findByText('La contraseña no es correcta')).toBeInTheDocument();
		expect(screen.getByRole('dialog')).toBeInTheDocument();
	});

	it('se cierra con Escape', async () => {
		mockAuth();
		const user = userEvent.setup();

		renderLoginModal();
		await openFromNavbar(user);
		await user.keyboard('{Escape}');

		await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
	});
});
