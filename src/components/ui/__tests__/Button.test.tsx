import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
	it('renderiza el contenido y responde al click', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(<Button onClick={handleClick}>Guardar</Button>);

		const button = screen.getByRole('button', { name: 'Guardar' });
		await user.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('no dispara onClick cuando está deshabilitado', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(
			<Button onClick={handleClick} disabled>
				Guardar
			</Button>
		);

		await user.click(screen.getByRole('button', { name: 'Guardar' }));

		expect(handleClick).not.toHaveBeenCalled();
	});

	it('deshabilita el botón y marca aria-busy cuando isLoading es true', () => {
		render(<Button isLoading>Guardar</Button>);

		const button = screen.getByRole('button', { name: 'Guardar' });
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute('aria-busy', 'true');
	});
});
