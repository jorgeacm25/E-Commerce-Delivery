import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminCategories, useManageCategories } from '../../../../hooks';
import { AdminCategoriesPage } from '../AdminCategoriesPage';
import { AdminCategory } from '../../../../interfaces';

vi.mock('../../../../hooks', async () => {
	const actual = await vi.importActual<typeof import('../../../../hooks')>('../../../../hooks');
	return { ...actual, useAdminCategories: vi.fn(), useManageCategories: vi.fn() };
});

const useAdminCategoriesMock = vi.mocked(useAdminCategories);
const useManageCategoriesMock = vi.mocked(useManageCategories);

const category: AdminCategory = {
	id: 'cat-1',
	slug: 'carnes',
	name: 'Carnes',
};

const renderPage = () => {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<AdminCategoriesPage />
			</MemoryRouter>
		</QueryClientProvider>
	);
};

describe('AdminCategoriesPage', () => {
	const create = vi.fn();
	const update = vi.fn();
	const remove = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		useAdminCategoriesMock.mockReturnValue({
			categories: [category],
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});

		useManageCategoriesMock.mockReturnValue({
			create,
			isCreating: false,
			update,
			isUpdating: false,
			remove,
			isDeleting: false,
		});
	});

	it('lista las categorías existentes', () => {
		renderPage();

		expect(screen.getByText('Carnes')).toBeInTheDocument();
		expect(screen.getByText('carnes')).toBeInTheDocument();
	});

	it('abre el modal y crea una categoría nueva', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /nueva categoría/i }));

		await user.type(screen.getByLabelText(/^nombre\*?$/i), 'Dulces');
		await user.type(screen.getByLabelText(/^slug\*?$/i), 'dulces');

		await user.click(screen.getByRole('button', { name: /^guardar$/i }));

		await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
		expect(create.mock.calls[0][0]).toMatchObject({ name: 'Dulces', slug: 'dulces' });
	});

	it('pide confirmación antes de eliminar y llama a remove al confirmar', async () => {
		const user = userEvent.setup();
		renderPage();

		await user.click(screen.getByRole('button', { name: /eliminar/i }));

		const dialog = screen.getByRole('dialog');
		expect(within(dialog).getByText('¿Eliminar esta categoría?')).toBeInTheDocument();

		await user.click(within(dialog).getByRole('button', { name: /^eliminar$/i }));

		await waitFor(() => expect(remove).toHaveBeenCalledWith('cat-1'));
	});
});
