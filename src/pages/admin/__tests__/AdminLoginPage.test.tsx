import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLoginPage } from '../AdminLoginPage';
import { useAuth } from '../../../hooks';

vi.mock('../../../hooks', () => ({
	useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const renderAdminLoginPage = (initialEntries: string[] = ['/admin/iniciar-sesion']) =>
	render(
		<MemoryRouter initialEntries={initialEntries}>
			<Routes>
				<Route path='/admin/iniciar-sesion' element={<AdminLoginPage />} />
				<Route path='/admin' element={<p>Panel admin</p>} />
			</Routes>
		</MemoryRouter>
	);

describe('AdminLoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('muestra errores de validación y no llama a staffSignIn si los campos están vacíos', async () => {
		const staffSignIn = vi.fn();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ staffSignIn } as any);
		const user = userEvent.setup();

		renderAdminLoginPage();
		await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(await screen.findByText('El correo o usuario es requerido')).toBeInTheDocument();
		expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
		expect(staffSignIn).not.toHaveBeenCalled();
	});

	it('inicia sesión de staff y redirige a /admin tras un login exitoso', async () => {
		const staffSignIn = vi.fn().mockResolvedValue({});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ staffSignIn } as any);
		const user = userEvent.setup();

		renderAdminLoginPage();
		await user.type(screen.getByLabelText(/usuario o correo/i), 'staff01');
		await user.type(screen.getByLabelText(/^contraseña/i), 'secreto123');
		await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(staffSignIn).toHaveBeenCalledWith({ email: 'staff01', password: 'secreto123' });
		expect(await screen.findByText('Panel admin')).toBeInTheDocument();
	});

	it('muestra el mensaje de error del backend cuando las credenciales son inválidas', async () => {
		const staffSignIn = vi.fn().mockRejectedValue(new Error('El usuario o la contraseña no son correctos'));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ staffSignIn } as any);
		const user = userEvent.setup();

		renderAdminLoginPage();
		await user.type(screen.getByLabelText(/usuario o correo/i), 'staff01');
		await user.type(screen.getByLabelText(/^contraseña/i), 'incorrecta');
		await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

		expect(
			await screen.findByText('El usuario o la contraseña no son correctos')
		).toBeInTheDocument();
	});
});
