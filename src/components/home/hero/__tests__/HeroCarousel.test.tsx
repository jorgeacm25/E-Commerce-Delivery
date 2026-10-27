import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HeroCarousel } from '../HeroCarousel';
import { heroSlides } from '../heroContent';

const visibleSlide = () =>
	screen
		.getAllByRole('group', { hidden: true })
		.find(slide => slide.getAttribute('aria-hidden') === 'false');

describe('HeroCarousel', () => {
	it('alterna diapositivas con los controles de siguiente, anterior y los puntos', async () => {
		const user = userEvent.setup();
		render(<HeroCarousel />);

		expect(visibleSlide()).toHaveAccessibleName(`1 de ${heroSlides.length}`);

		await user.click(screen.getByRole('button', { name: /diapositiva siguiente/i }));
		expect(visibleSlide()).toHaveTextContent(/somos tu mejor opción/i);

		await user.click(screen.getByRole('button', { name: /diapositiva anterior/i }));
		await user.click(screen.getByRole('button', { name: /diapositiva anterior/i }));
		expect(visibleSlide()).toHaveAccessibleName(
			`${heroSlides.length} de ${heroSlides.length}`
		);

		await user.click(screen.getByRole('button', { name: /ir a la diapositiva 3/i }));
		expect(visibleSlide()).toHaveAccessibleName(`3 de ${heroSlides.length}`);
	});

	it('permite pausar y reanudar la reproducción automática', async () => {
		const user = userEvent.setup();
		render(<HeroCarousel />);

		await user.click(screen.getByRole('button', { name: /pausar carrusel/i }));
		expect(screen.getByRole('button', { name: /reproducir carrusel/i })).toBeInTheDocument();
	});
});
