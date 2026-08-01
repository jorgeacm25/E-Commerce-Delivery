import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordPage } from '../ForgotPasswordPage';
import { useAuth } from '../../../hooks';

vi.mock('../../../hooks', () => ({
	useAuth: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const renderPage = () =>
	render(
		<MemoryRouter>
			<ForgotPasswordPage />
		</MemoryRouter>
	);

describe('ForgotPasswordPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('exige un correo válido antes de enviar', async () => {
		const requestPasswordReset = vi.fn();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ requestPasswordReset } as any);
		const user = userEvent.setup();

		renderPage();
		await user.type(screen.getByLabelText(/correo electrónico/i), 'no-es-un-correo');
		await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

		expect(await screen.findByText('El correo electrónico no es válido')).toBeInTheDocument();
		expect(requestPasswordReset).not.toHaveBeenCalled();
	});

	it('muestra un mensaje de confirmación genérico tras enviar el enlace', async () => {
		const requestPasswordReset = vi.fn().mockResolvedValue({});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		useAuthMock.mockReturnValue({ requestPasswordReset } as any);
		const user = userEvent.setup();

		renderPage();
		await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@example.com');
		await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

		expect(requestPasswordReset).toHaveBeenCalledWith('ana@example.com');
		expect(await screen.findByText('Enlace enviado')).toBeInTheDocument();
	});
});
