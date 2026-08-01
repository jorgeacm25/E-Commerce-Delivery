import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage } from '../RegisterPage';
import { useAuth } from '../../../hooks';

vi.mock('../../../hooks', () => ({
	useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const renderRegisterPage = () =>
	render(
		<MemoryRouter initialEntries={['/registrarse']}>
			<Routes>
				<Route path='/registrarse' element={<RegisterPage />} />
				<Route path='/' element={<p>Inicio</p>} />
			</Routes>
		</MemoryRouter>
	);

const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez');
	await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
	await user.type(screen.getByLabelText(/^contraseña/i), 'secreto123');
	await user.type(screen.getByLabelText(/confirmar contraseña/i), 'secreto123');
};

describe('RegisterPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('valida que las contraseñas coincidan', async () => {
		const signUp = vi.fn();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ signUp } as any);
		const user = userEvent.setup();

		renderRegisterPage();
		await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez');
		await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
		await user.type(screen.getByLabelText(/^contraseña/i), 'secreto123');
		await user.type(screen.getByLabelText(/confirmar contraseña/i), 'otradistinta');
		await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

		expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
		expect(signUp).not.toHaveBeenCalled();
	});

	it('muestra el aviso de confirmación de correo cuando needsEmailConfirmation es true', async () => {
		const signUp = vi.fn().mockResolvedValue({ needsEmailConfirmation: true });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ signUp } as any);
		const user = userEvent.setup();

		renderRegisterPage();
		await fillValidForm(user);
		await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

		expect(signUp).toHaveBeenCalledWith({
			email: 'ana@example.com',
			password: 'secreto123',
			fullName: 'Ana Pérez',
			phone: '',
		});
		expect(await screen.findByText('Revisa tu correo')).toBeInTheDocument();
	});

	it('navega al inicio cuando el registro no requiere confirmación de correo', async () => {
		const signUp = vi.fn().mockResolvedValue({ needsEmailConfirmation: false });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ signUp } as any);
		const user = userEvent.setup();

		renderRegisterPage();
		await fillValidForm(user);
		await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

		expect(await screen.findByText('Inicio')).toBeInTheDocument();
	});

	it('muestra el mensaje de error cuando el correo ya está registrado', async () => {
		// El backend .NET ya devuelve el mensaje en español (ver
		// CustomerRegisteredError) — no hace falta traducirlo.
		const signUp = vi.fn().mockRejectedValue(new Error('Ya existe un cliente registrado con ese email'));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ signUp } as any);
		const user = userEvent.setup();

		renderRegisterPage();
		await fillValidForm(user);
		await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

		expect(await screen.findByText('Ya existe un cliente registrado con ese email')).toBeInTheDocument();
	});
});
