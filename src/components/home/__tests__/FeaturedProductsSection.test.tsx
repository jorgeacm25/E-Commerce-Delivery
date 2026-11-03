import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FeaturedProductsSection } from '../FeaturedProductsSection';
import { featuredProductsMock } from '../../../data/home.mock';

const renderSection = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<FeaturedProductsSection />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('FeaturedProductsSection', () => {
	it('los datos de prueba traen al menos 8 productos, todos con foto', () => {
		expect(featuredProductsMock.length).toBeGreaterThanOrEqual(8);
		for (const product of featuredProductsMock) {
			expect(product.imageUrl).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
		}
	});

	it('muestra cada producto con su foto, categoría y enlace a la categoría', async () => {
		renderSection();

		const items = await screen.findAllByRole('listitem');
		expect(items).toHaveLength(featuredProductsMock.length);

		const picadillo = items.find(item => within(item).queryByText('Picadillo de res 1lb'));
		expect(picadillo).toBeDefined();
		const scope = within(picadillo as HTMLElement);
		expect(scope.getByRole('img', { name: 'Picadillo de res 1lb' })).toHaveAttribute(
			'src',
			expect.stringContaining('images.unsplash.com')
		);
		expect(scope.getByText('Cárnicos')).toBeInTheDocument();
		expect(scope.getByRole('link')).toHaveAttribute('href', '/categoria/carnes-y-embutidos');
	});
});
