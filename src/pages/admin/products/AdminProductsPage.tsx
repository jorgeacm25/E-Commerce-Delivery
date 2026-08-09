import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import {
	Button,
	CurrencyDisplay,
	DataTable,
	IconButton,
	PageHeader,
	Pagination,
	SearchInput,
	Select,
} from '../../../components/ui';
import { useAdminCategories, useAdminProducts } from '../../../hooks';

const PAGE_SIZE = 10;

export const AdminProductsPage = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const query = searchParams.get('buscar') ?? '';
	const categoryId = searchParams.get('categoria') ?? undefined;
	const page = Number(searchParams.get('pagina') ?? '1');

	const updateParams = (updates: Record<string, string | null>) => {
		const next = new URLSearchParams(searchParams);
		Object.entries(updates).forEach(([key, value]) => {
			if (value === null) next.delete(key);
			else next.set(key, value);
		});
		setSearchParams(next);
	};

	const { categories } = useAdminCategories();
	const { products, totalPages, isLoading } = useAdminProducts({
		query: query || undefined,
		categoryId,
		page,
		pageSize: PAGE_SIZE,
	});

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader
				title='Productos'
				description='Gestiona el inventario de productos del almacén.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={() => navigate('/admin/productos/nuevo')}>
						Nuevo producto
					</Button>
				}
			/>

			<div className='flex flex-col gap-3 sm:flex-row'>
				<SearchInput
					placeholder='Buscar por nombre...'
					value={query}
					onChange={event => updateParams({ buscar: event.target.value || null, pagina: null })}
					onClear={() => updateParams({ buscar: null, pagina: null })}
					containerClassName='sm:max-w-xs'
				/>

				<Select
					placeholder='Todas las categorías'
					value={categoryId ?? ''}
					onChange={event => updateParams({ categoria: event.target.value || null, pagina: null })}
					options={categories.map(category => ({ value: category.id, label: category.name }))}
					containerClassName='sm:max-w-xs'
				/>
			</div>

			<DataTable
				columns={[
					{
						key: 'product',
						header: 'Producto',
						render: product => (
							<div className='flex items-center gap-3'>
								{product.images[0] && (
									<img
										src={product.images[0]}
										alt=''
										className='h-10 w-10 rounded-lg object-cover'
									/>
								)}
								<div>
									<p className='font-medium text-neutral-900'>{product.name}</p>
									<p className='text-xs text-neutral-500'>{product.categoryName}</p>
								</div>
							</div>
						),
					},
					{
						key: 'price',
						header: 'Precio',
						render: product => (
							<CurrencyDisplay
								usd={product.priceUsd}
								discountedUsd={product.discountPriceUsd ?? undefined}
								size='sm'
							/>
						),
					},
					{
						key: 'stock',
						header: 'Stock',
						render: product => `${product.stock} ${product.unit}`,
					},
					{
						key: 'provider',
						header: 'Proveedor',
						render: product => product.provider,
					},
					{
						key: 'actions',
						header: '',
						className: 'text-right',
						render: product => (
							<div className='flex justify-end'>
								<IconButton
									icon={<FiEdit2 />}
									label='Editar'
									onClick={() => navigate(`/admin/productos/${product.id}/editar`)}
								/>
							</div>
						),
					},
				]}
				data={products}
				getRowId={product => product.id}
				isLoading={isLoading}
				emptyTitle='No hay productos todavía'
				emptyDescription='Crea el primer producto para empezar a construir el inventario.'
			/>

			<Pagination page={page} totalPages={totalPages} onPageChange={next => updateParams({ pagina: String(next) })} />
		</div>
	);
};
