import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResetPasswordPage } from '../ResetPasswordPage';
import { useAuth } from '../../../hooks';

vi.mock('../../../hooks', () => ({
	useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const renderPage = (initialEntry = '/restablecer-contrasena') =>
	render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<Routes>
				<Route path='/restablecer-contrasena' element={<ResetPasswordPage />} />
				<Route path='/iniciar-sesion' element={<p>Página de login</p>} />
			</Routes>
		</MemoryRouter>
	);

describe('ResetPasswordPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('muestra un aviso de enlace inválido si no hay token en la URL', () => {
		useAuthMock.mockReturnValue({
			resetPassword: vi.fn(),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		renderPage();

		expect(screen.getByText('Enlace no válido o expirado')).toBeInTheDocument();
	});

	it('valida que las contraseñas coincidan cuando hay un token en la URL', async () => {
		const resetPassword = vi.fn();
		useAuthMock.mockReturnValue({
			resetPassword,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		const user = userEvent.setup();

		renderPage('/restablecer-contrasena?token=abc123');
		await user.type(screen.getByLabelText(/^nueva contraseña/i), 'nuevaClave1');
		await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), 'otraClave2');
		await user.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

		expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
		expect(resetPassword).not.toHaveBeenCalled();
	});

	it('restablece la contraseña con el token de la URL y muestra la confirmación de éxito', async () => {
		const resetPassword = vi.fn().mockResolvedValue(undefined);
		useAuthMock.mockReturnValue({
			resetPassword,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		const user = userEvent.setup();

		renderPage('/restablecer-contrasena?token=abc123');
		await user.type(screen.getByLabelText(/^nueva contraseña/i), 'nuevaClave1');
		await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), 'nuevaClave1');
		await user.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

		expect(resetPassword).toHaveBeenCalledWith('abc123', 'nuevaClave1');
		expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument();
	});
});
