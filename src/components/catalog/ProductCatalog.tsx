import { useState } from 'react';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { useCatalogProducts, useCategories } from '../../hooks';
import { AvailabilityFilter, ProductSort } from '../../interfaces';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { IconButton } from '../ui/IconButton';
import { Pagination } from '../ui/Pagination';
import { SearchInput } from '../ui/SearchInput';
import { Select, SelectOption } from '../ui/Select';
import { Skeleton } from '../ui/Skeleton';
import { SectionState } from '../home/SectionState';
import { CatalogFilterValues, FilterPanel } from './FilterPanel';
import { ProductGrid } from './ProductGrid';
import { ProductListRow } from './ProductListRow';

const PAGE_SIZE = 8;

const sortOptions: SelectOption[] = [
	{ value: 'relevance', label: 'Relevancia' },
	{ value: 'price-asc', label: 'Precio: menor a mayor' },
	{ value: 'price-desc', label: 'Precio: mayor a menor' },
	{ value: 'popularity', label: 'Popularidad' },
];

const ResultsSkeleton = () => (
	<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
		{Array.from({ length: PAGE_SIZE }).map((_, index) => (
			<Skeleton key={index} className='h-56 rounded-2xl' />
		))}
	</div>
);

interface Props {
	fixedCategorySlug?: string;
}

// Motor de exploración de productos compartido por el Catálogo, las páginas
// de Categoría y los Resultados de búsqueda (que reutilizan /catalogo?buscar=).
export const ProductCatalog = ({ fixedCategorySlug }: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
	const { categories } = useCategories();

	const query = searchParams.get('buscar') ?? '';
	const categorySlug = fixedCategorySlug ?? searchParams.get('categoria') ?? '';
	const availability = searchParams.get('disponibilidad') ?? '';
	const minPrice = searchParams.get('precioMin') ?? '';
	const maxPrice = searchParams.get('precioMax') ?? '';
	const sort = (searchParams.get('orden') as ProductSort | null) ?? 'relevance';
	const page = Number(searchParams.get('pagina') ?? '1') || 1;
	const view = searchParams.get('vista') === 'lista' ? 'lista' : 'grid';

	// `null` borra el parámetro de la URL, `undefined` lo deja sin tocar
	// (útil para omitir "categoria" en /categoria/:slug, donde no aplica).
	const updateParams = (updates: Record<string, string | null | undefined>) => {
		setSearchParams(prev => {
			const next = new URLSearchParams(prev);
			Object.entries(updates).forEach(([key, value]) => {
				if (value === undefined) return;
				if (value === null || value === '') next.delete(key);
				else next.set(key, value);
			});
			return next;
		});
	};

	const { result, isLoading, isError, refetch } = useCatalogProducts({
		query: query || undefined,
		categorySlug: categorySlug || undefined,
		availability: (availability || undefined) as AvailabilityFilter | undefined,
		minPrice: minPrice ? Number(minPrice) : undefined,
		maxPrice: maxPrice ? Number(maxPrice) : undefined,
		sort,
		page,
		pageSize: PAGE_SIZE,
	});

	const categoryOptions: SelectOption[] = [
		{ value: '', label: 'Todas las categorías' },
		...categories.map(category => ({ value: category.slug, label: category.name })),
	];

	const filterValues: CatalogFilterValues = {
		categorySlug: fixedCategorySlug ? '' : categorySlug,
		availability,
		minPrice,
		maxPrice,
	};

	const handleFilterChange = (values: CatalogFilterValues) => {
		updateParams({
			categoria: fixedCategorySlug ? null : values.categorySlug || null,
			disponibilidad: values.availability || null,
			precioMin: values.minPrice || null,
			precioMax: values.maxPrice || null,
			pagina: null,
		});
	};

	const hasActiveFilters =
		Boolean(query) ||
		(!fixedCategorySlug && Boolean(categorySlug)) ||
		Boolean(availability) ||
		Boolean(minPrice) ||
		Boolean(maxPrice);

	const clearFilters = () => {
		updateParams({
			buscar: null,
			categoria: fixedCategorySlug ? undefined : null,
			disponibilidad: null,
			precioMin: null,
			precioMax: null,
			pagina: null,
		});
	};

	return (
		<div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
			<aside className='hidden w-64 shrink-0 rounded-2xl border border-neutral-200 bg-white p-5 lg:block'>
				<h2 className='mb-4 font-semibold text-neutral-900'>Filtros</h2>
				<FilterPanel
					values={filterValues}
					onChange={handleFilterChange}
					categoryOptions={categoryOptions}
					showCategoryFilter={!fixedCategorySlug}
				/>
			</aside>

			<div className='flex flex-1 flex-col gap-4'>
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<SearchInput
						value={query}
						onChange={event => updateParams({ buscar: event.target.value || null, pagina: null })}
						onClear={() => updateParams({ buscar: null, pagina: null })}
						placeholder='Buscar en el catálogo...'
						containerClassName='sm:max-w-xs'
					/>

					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							leftIcon={<FiFilter />}
							className='lg:hidden'
							onClick={() => setIsFilterDrawerOpen(true)}
						>
							Filtros
						</Button>

						<Select
							aria-label='Ordenar por'
							value={sort}
							options={sortOptions}
							onChange={event => updateParams({ orden: event.target.value, pagina: null })}
							containerClassName='w-44'
						/>

						<div className='flex items-center gap-1 rounded-lg border border-neutral-300 p-1'>
							<IconButton
								icon={<FiGrid />}
								label='Vista de cuadrícula'
								size='sm'
								aria-pressed={view === 'grid'}
								className={view === 'grid' ? 'bg-primary-100 text-primary-700' : ''}
								onClick={() => updateParams({ vista: null })}
							/>
							<IconButton
								icon={<FiList />}
								label='Vista de lista'
								size='sm'
								aria-pressed={view === 'lista'}
								className={view === 'lista' ? 'bg-primary-100 text-primary-700' : ''}
								onClick={() => updateParams({ vista: 'lista' })}
							/>
						</div>
					</div>
				</div>

				<SectionState
					isLoading={isLoading}
					isError={isError}
					isEmpty={result.items.length === 0}
					onRetry={refetch}
					loadingFallback={<ResultsSkeleton />}
					emptyTitle='No encontramos productos con esos filtros'
					emptyDescription='Prueba a ajustar la búsqueda o quitar algún filtro.'
				>
					{view === 'grid' ? (
						<ProductGrid products={result.items} />
					) : (
						<ProductListRow products={result.items} className='flex flex-col gap-3' />
					)}

					<Pagination
						page={result.page}
						totalPages={result.totalPages}
						onPageChange={nextPage => updateParams({ pagina: String(nextPage) })}
						className='mt-6'
					/>
				</SectionState>

				{hasActiveFilters && (
					<button
						type='button'
						onClick={clearFilters}
						className='focus-ring self-start text-sm font-medium text-primary-700 hover:underline'
					>
						Limpiar filtros
					</button>
				)}
			</div>

			<Drawer
				isOpen={isFilterDrawerOpen}
				onClose={() => setIsFilterDrawerOpen(false)}
				title='Filtros'
			>
				<FilterPanel
					values={filterValues}
					onChange={handleFilterChange}
					categoryOptions={categoryOptions}
					showCategoryFilter={!fixedCategorySlug}
				/>
			</Drawer>
		</div>
	);
};
