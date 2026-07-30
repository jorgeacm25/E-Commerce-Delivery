import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../Modal';

describe('Modal', () => {
	it('no renderiza contenido cuando isOpen es false', () => {
		render(
			<Modal isOpen={false} onClose={vi.fn()} title='Detalle'>
				Contenido
			</Modal>
		);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('renderiza el título y el contenido cuando isOpen es true', () => {
		render(
			<Modal isOpen onClose={vi.fn()} title='Detalle del pedido'>
				Contenido del pedido
			</Modal>
		);

		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Detalle del pedido')).toBeInTheDocument();
		expect(screen.getByText('Contenido del pedido')).toBeInTheDocument();
	});

	it('llama a onClose al presionar Escape y al hacer click en el botón cerrar', async () => {
		const user = userEvent.setup();
		const handleClose = vi.fn();

		render(
			<Modal isOpen onClose={handleClose} title='Detalle'>
				Contenido
			</Modal>
		);

		await user.click(screen.getByRole('button', { name: 'Cerrar' }));
		expect(handleClose).toHaveBeenCalledTimes(1);

		await user.keyboard('{Escape}');
		expect(handleClose).toHaveBeenCalledTimes(2);
	});
});
