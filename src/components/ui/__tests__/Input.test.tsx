import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
	it('asocia el label con el campo y permite escribir', async () => {
		const user = userEvent.setup();

		render(<Input label='Nombre completo' />);

		const input = screen.getByLabelText('Nombre completo');
		await user.type(input, 'Ana Gómez');

		expect(input).toHaveValue('Ana Gómez');
	});

	it('muestra el mensaje de error y marca aria-invalid', () => {
		render(<Input label='Correo' error='Correo inválido' />);

		const input = screen.getByLabelText('Correo');
		const error = screen.getByRole('alert');

		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(error).toHaveTextContent('Correo inválido');
	});
});
