import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuantitySelector } from '../QuantitySelector';

describe('QuantitySelector', () => {
	it('incrementa y decrementa la cantidad', async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(<QuantitySelector quantity={2} onChange={handleChange} />);

		await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));
		expect(handleChange).toHaveBeenLastCalledWith(3);

		await user.click(screen.getByRole('button', { name: 'Disminuir cantidad' }));
		expect(handleChange).toHaveBeenLastCalledWith(1);
	});

	it('deshabilita disminuir en el mínimo y aumentar en el máximo', () => {
		const { rerender } = render(
			<QuantitySelector quantity={1} onChange={vi.fn()} min={1} max={5} />
		);

		expect(screen.getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled();

		rerender(<QuantitySelector quantity={5} onChange={vi.fn()} min={1} max={5} />);

		expect(screen.getByRole('button', { name: 'Aumentar cantidad' })).toBeDisabled();
	});
});
