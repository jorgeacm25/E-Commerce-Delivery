import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
	it('no renderiza nada cuando isOpen es false', () => {
		render(
			<ConfirmDialog
				isOpen={false}
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				title='¿Eliminar producto?'
			/>
		);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('muestra el título y la descripción', () => {
		render(
			<ConfirmDialog
				isOpen
				onClose={vi.fn()}
				onConfirm={vi.fn()}
				title='¿Eliminar producto?'
				description='Esta acción no se puede deshacer.'
			/>
		);

		expect(screen.getByText('¿Eliminar producto?')).toBeInTheDocument();
		expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();
	});

	it('llama a onConfirm al confirmar y a onClose al cancelar', async () => {
		const user = userEvent.setup();
		const handleConfirm = vi.fn();
		const handleClose = vi.fn();

		render(
			<ConfirmDialog
				isOpen
				onClose={handleClose}
				onConfirm={handleConfirm}
				title='¿Eliminar producto?'
				confirmLabel='Eliminar'
				cancelLabel='Cancelar'
			/>
		);

		await user.click(screen.getByRole('button', { name: 'Eliminar' }));
		expect(handleConfirm).toHaveBeenCalledTimes(1);

		await user.click(screen.getByRole('button', { name: 'Cancelar' }));
		expect(handleClose).toHaveBeenCalledTimes(1);
	});
});
