import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HomePage } from '../HomePage';

const renderHomePage = () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<HomePage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('HomePage', () => {
	it('muestra la propuesta de valor y los botones principales de comprar y rastrear', () => {
		renderHomePage();

		expect(
			screen.getByRole('heading', {
				name: /compra alimentos y combos para tu familia en cuba/i,
			})
		).toBeInTheDocument();

		expect(screen.getByRole('link', { name: /comprar ahora/i })).toHaveAttribute(
			'href',
			'/catalogo'
		);
		expect(screen.getByRole('link', { name: /rastrear pedido/i })).toHaveAttribute(
			'href',
			'/rastrear-pedido'
		);
	});

	it('carga y muestra las categorías destacadas después del estado de carga', async () => {
		renderHomePage();

		const categoriesSection = screen
			.getByRole('heading', { name: /categorías destacadas/i })
			.closest('section') as HTMLElement;

		expect(
			await within(categoriesSection).findByRole('link', { name: /despensa/i })
		).toBeInTheDocument();
	});

	it('muestra las preguntas frecuentes tras cargar el servicio simulado', async () => {
		renderHomePage();

		const faqSection = screen
			.getByRole('heading', { name: /preguntas frecuentes/i })
			.closest('section') as HTMLElement;

		expect(
			await within(faqSection).findByText(/¿puedo comprar si no estoy en cuba\?/i)
		).toBeInTheDocument();
	});
});
