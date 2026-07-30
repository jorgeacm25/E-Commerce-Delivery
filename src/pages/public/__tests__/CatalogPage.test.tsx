import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CatalogPage } from '../CatalogPage';

const LocationProbe = () => {
	const location = useLocation();
	return <div data-testid='location-search'>{location.search}</div>;
};

const renderCatalogPage = (initialEntries: string[] = ['/catalogo']) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={initialEntries}>
				<CatalogPage />
				<LocationProbe />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('CatalogPage', () => {
	it('carga y muestra los productos del catálogo', async () => {
		renderCatalogPage();

		expect(
			await screen.findByRole('link', { name: /arroz 5lb/i })
		).toBeInTheDocument();
	});

	it('filtra por texto de búsqueda y sincroniza el parámetro en la URL', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('link', { name: /arroz 5lb/i });

		const searchBox = screen.getByRole('searchbox', { name: /buscar en el catálogo/i });
		await user.type(searchBox, 'arroz');

		expect(await screen.findByRole('link', { name: /arroz 5lb/i })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: /café molido/i })).not.toBeInTheDocument();

		await waitFor(() =>
			expect(screen.getByTestId('location-search')).toHaveTextContent('buscar=arroz')
		);
	});

	it('filtra por categoría y sincroniza el parámetro en la URL', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('link', { name: /arroz 5lb/i });

		const categorySelect = screen.getByLabelText('Categoría');
		await user.selectOptions(categorySelect, 'bebidas');

		expect(await screen.findByRole('link', { name: /refresco de cola/i })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: /arroz 5lb/i })).not.toBeInTheDocument();

		await waitFor(() =>
			expect(screen.getByTestId('location-search')).toHaveTextContent('categoria=bebidas')
		);
	});

	it('filtra por disponibilidad', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('link', { name: /arroz 5lb/i });

		const availabilitySelect = screen.getByLabelText('Disponibilidad');
		await user.selectOptions(availabilitySelect, 'out_of_stock');

		expect(await screen.findByRole('link', { name: /azúcar blanca/i })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: /arroz 5lb/i })).not.toBeInTheDocument();
	});
});
