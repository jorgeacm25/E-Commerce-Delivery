import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../../hooks';

vi.mock('../../../hooks', () => ({
	useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const renderLoginPage = (initialEntries: string[] = ['/iniciar-sesion']) =>
	render(
		<MemoryRouter initialEntries={initialEntries}>
			<Routes>
				<Route path='/iniciar-sesion' element={<LoginPage />} />
				<Route path='/' element={<p>Inicio</p>} />
				<Route path='/mi-cuenta/pedidos' element={<p>Mis pedidos</p>} />
			</Routes>
		</MemoryRouter>
	);

describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('muestra errores de validación y no llama a signIn si los campos están vacíos', async () => {
		const signIn = vi.fn();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ signIn } as any);
		const user = userEvent.setup();

		renderLoginPage();
		await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(await screen.findByText('El correo electrónico es requerido')).toBeInTheDocument();
		expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
		expect(signIn).not.toHaveBeenCalled();
	});

	it('inicia sesión y redirige a la página de origen tras un login exitoso', async () => {
		const signIn = vi.fn().mockResolvedValue({});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ signIn } as any);
		const user = userEvent.setup();

		renderLoginPage(['/iniciar-sesion']);
		await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
		await user.type(screen.getByLabelText(/^contraseña/i), 'secreto123');
		await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(signIn).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'secreto123' });
		expect(await screen.findByText('Inicio')).toBeInTheDocument();
	});

	it('muestra el mensaje de error traducido cuando las credenciales son inválidas', async () => {
		const signIn = vi.fn().mockRejectedValue(new Error('Invalid login credentials'));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ signIn } as any);
		const user = userEvent.setup();

		renderLoginPage();
		await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
		await user.type(screen.getByLabelText(/^contraseña/i), 'incorrecta');
		await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument();
	});
});
