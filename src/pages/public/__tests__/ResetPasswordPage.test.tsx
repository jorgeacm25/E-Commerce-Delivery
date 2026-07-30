import type { Session } from '@supabase/supabase-js';
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

const renderPage = () =>
	render(
		<MemoryRouter initialEntries={['/restablecer-contrasena']}>
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

	it('muestra un aviso de enlace inválido si no hay sesión de recuperación', () => {
		useAuthMock.mockReturnValue({
			session: null,
			isInitializing: false,
			updatePassword: vi.fn(),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		renderPage();

		expect(screen.getByText('Enlace no válido o expirado')).toBeInTheDocument();
	});

	it('valida que las contraseñas coincidan cuando hay sesión de recuperación', async () => {
		const updatePassword = vi.fn();
		useAuthMock.mockReturnValue({
			session: { user: { id: 'user-1' } } as unknown as Session,
			isInitializing: false,
			updatePassword,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		const user = userEvent.setup();

		renderPage();
		await user.type(screen.getByLabelText(/^nueva contraseña/i), 'nuevaClave1');
		await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), 'otraClave2');
		await user.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

		expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
		expect(updatePassword).not.toHaveBeenCalled();
	});

	it('actualiza la contraseña y muestra la confirmación de éxito', async () => {
		const updatePassword = vi.fn().mockResolvedValue(undefined);
		useAuthMock.mockReturnValue({
			session: { user: { id: 'user-1' } } as unknown as Session,
			isInitializing: false,
			updatePassword,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
		const user = userEvent.setup();

		renderPage();
		await user.type(screen.getByLabelText(/^nueva contraseña/i), 'nuevaClave1');
		await user.type(screen.getByLabelText(/confirmar nueva contraseña/i), 'nuevaClave1');
		await user.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

		expect(updatePassword).toHaveBeenCalledWith('nuevaClave1');
		expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument();
	});
});
