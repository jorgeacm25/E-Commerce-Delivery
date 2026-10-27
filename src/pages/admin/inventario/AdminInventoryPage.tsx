import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiAlertTriangle, FiEdit2, FiMinus, FiPlus } from 'react-icons/fi';
import {
	Badge,
	BadgeVariant,
	Button,
	CurrencyDisplay,
	DataTable,
	IconButton,
	PageHeader,
	Pagination,
	SearchInput,
	Select,
	Tabs,
} from '../../../components/ui';
import { RegisterProductInModal } from '../../../components/admin/warehouse/RegisterProductInModal';
import { RegisterProductOutModal } from '../../../components/admin/warehouse/RegisterProductOutModal';
import {
	useActiveExchangeRate,
	useAdminCategories,
	useAdminProducts,
	useProductOuts,
	useRegisterProductIn,
	useRegisterProductOut,
	useStockAlerts,
	useWarehouseHistory,
} from '../../../hooks';
import { buildInventoryMetrics } from '../../../services/almacen.service';
import { formatCup, formatDateLong, formatPrice } from '../../../helpers';

const PAGE_SIZE = 10;
// Mismo umbral que getStockAlerts (src/services/almacen.service.ts).
const LOW_STOCK_THRESHOLD = 10;

// Variantes del badge por tipo de movimiento del histórico (el enum del
// backend se serializa como string — JsonStringEnumConverter en
// Program.cs). Cualquier tipo nuevo cae en 'neutral'.
const actionTypeVariant: Record<string, BadgeVariant> = {
	Entrada: 'success',
	Salida: 'warning',
	Creaciones: 'primary',
	Modificaciones: 'secondary',
	Eliminaciones: 'danger',
	login: 'neutral',
};

// GET /api/history devuelve TODO el histórico del sistema (logins,
// clientes, pedidos...) sin filtro server-side. Por defecto se muestran
// solo los movimientos de stock (Entrada/Salida); el resto queda
// disponible bajo "Todo el histórico".
const historyFilterOptions = [
	{ value: 'movements', label: 'Entradas y salidas' },
	{ value: 'all', label: 'Todo el histórico' },
	{ value: 'Entrada', label: 'Solo entradas' },
	{ value: 'Salida', label: 'Solo salidas' },
];

const inventoryTabs = [
	{ value: 'productos', label: 'Productos' },
	{ value: 'alertas', label: 'Alertas' },
	{ value: 'historial', label: 'Historial' },
];

// Sección Inventario: fusión de las antiguas páginas "Productos" y
// "Almacén" (/admin/productos y /admin/almacen redirigen aquí). La tabla
// de productos es la protagonista — con las columnas de negocio pedidas
// (costo, dólar, salida, stock, última entrada, salidas y rendimiento) y
// acciones de entrada/salida por fila — y las secciones de alertas e
// historial del almacén viven como pestañas.
export const AdminInventoryPage = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const query = searchParams.get('buscar') ?? '';
	const categoryId = searchParams.get('categoria') ?? undefined;
	const page = Number(searchParams.get('pagina') ?? '1');

	const [activeTab, setActiveTab] = useState('productos');
	const [inModalOpen, setInModalOpen] = useState(false);
	const [outModalOpen, setOutModalOpen] = useState(false);
	const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
	const [historyFilter, setHistoryFilter] = useState('movements');

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
	const { history, isLoading: isLoadingHistory } = useWarehouseHistory();
	const { productOuts, isLoading: isLoadingOuts } = useProductOuts();
	const { alerts, isLoading: isLoadingAlerts } = useStockAlerts();
	const { data: exchangeRate } = useActiveExchangeRate();
	const { mutate: registerIn, isPending: isRegisteringIn } = useRegisterProductIn();
	const { mutate: registerOut, isPending: isRegisteringOut } = useRegisterProductOut();

	const rate = exchangeRate?.valor_cup_por_usd ?? null;

	const metrics = useMemo(
		() => buildInventoryMetrics(products, history, productOuts),
		[products, history, productOuts]
	);

	const openIn = (productId?: string) => {
		setSelectedProductId(productId);
		setInModalOpen(true);
	};
	const openOut = (productId?: string) => {
		setSelectedProductId(productId);
		setOutModalOpen(true);
	};
	const closeIn = () => {
		setInModalOpen(false);
		setSelectedProductId(undefined);
	};
	const closeOut = () => {
		setOutModalOpen(false);
		setSelectedProductId(undefined);
	};

	const filteredHistory = history.filter(entry => {
		if (historyFilter === 'all') return true;
		if (historyFilter === 'movements') return entry.actionType === 'Entrada' || entry.actionType === 'Salida';
		return entry.actionType === historyFilter;
	});

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Inventario'
				description='Productos, alertas e historial de entradas y salidas en un solo lugar.'
				actions={
					<>
						<Button leftIcon={<FiPlus />} onClick={() => navigate('/admin/productos/nuevo')}>
							Nuevo producto
						</Button>
						<Button variant='outline' leftIcon={<FiPlus />} onClick={() => openIn()}>
							Registrar entrada
						</Button>
						<Button variant='outline' leftIcon={<FiMinus />} onClick={() => openOut()}>
							Registrar salida
						</Button>
					</>
				}
			/>

			<Tabs tabs={inventoryTabs} value={activeTab} onChange={setActiveTab} />

			{activeTab === 'productos' && (
				<div className='flex flex-col gap-4'>
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
								key: 'category',
								header: 'Categoría',
								render: product => product.categoryName || '—',
							},
							{
								key: 'identifier',
								header: 'Identificador',
								render: product => (
									<span className='font-mono text-xs text-neutral-500' title={product.id}>
										{product.id.slice(0, 8)}
									</span>
								),
							},
							{
								key: 'product',
								header: 'Nombre',
								render: product => (
									<div className='flex items-center gap-3'>
										{product.images[0] && (
											<img
												src={product.images[0]}
												alt=''
												className='h-9 w-9 rounded-lg object-cover'
											/>
										)}
										<span className='font-medium text-neutral-900'>{product.name}</span>
									</div>
								),
							},
							{
								key: 'cost',
								header: 'Precio de compra',
								render: product =>
									product.costCup != null ? (
										<span className='whitespace-nowrap'>{formatCup(product.costCup)}</span>
									) : (
										'—'
									),
							},
							{
								key: 'rate',
								header: 'Precio del dólar',
								render: () =>
									rate != null ? (
										<span className='whitespace-nowrap'>{rate} CUP/USD</span>
									) : (
										'—'
									),
							},
							{
								key: 'price',
								header: 'Precio de salida',
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
								header: 'Stock actual',
								render: product => (
									<span>
										{product.stock} {product.unit}
										{product.stock <= LOW_STOCK_THRESHOLD && (
											<Badge variant='warning' className='ml-2'>
												Bajo
											</Badge>
										)}
									</span>
								),
							},
							{
								key: 'lastEntry',
								header: 'Última entrada',
								render: product => {
									const lastEntryAt = metrics.get(product.id)?.lastEntryAt ?? null;
									return lastEntryAt ? formatDateLong(lastEntryAt) : '—';
								},
							},
							{
								key: 'outs',
								header: 'Salidas',
								render: product => {
									const metric = metrics.get(product.id);
									const units = metric?.outsUnits ?? 0;
									const movements = metric?.outsMovements ?? 0;
									return (
										<span
											title={`${movements} ${movements === 1 ? 'movimiento' : 'movimientos'}`}
										>
											{units}
										</span>
									);
								},
							},
							{
								key: 'yield',
								header: 'Rendimiento/venta',
								render: product => {
									// Precio efectivo (con descuento si aplica) menos el costo
									// convertido a USD con la tasa vigente. Sin costo o sin tasa
									// no hay dato confiable: '—'.
									if (product.costCup == null || rate == null) return '—';
									const margin =
										(product.discountPriceUsd ?? product.priceUsd) - product.costCup / rate;
									return (
										<span
											className={
												margin >= 0 ? 'font-medium text-success-600' : 'font-medium text-danger-600'
											}
										>
											{formatPrice(margin)}
										</span>
									);
								},
							},
							{
								key: 'actions',
								header: '',
								className: 'text-right',
								render: product => (
									<div className='flex items-center justify-end gap-1'>
										<IconButton
											icon={<FiPlus />}
											label={`Entrada de ${product.name}`}
											onClick={() => openIn(product.id)}
										/>
										<IconButton
											icon={<FiMinus />}
											label={`Salida de ${product.name}`}
											onClick={() => openOut(product.id)}
										/>
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
						isLoading={isLoading || isLoadingHistory || isLoadingOuts}
						emptyTitle='No hay productos todavía'
						emptyDescription='Crea el primer producto para empezar a construir el inventario.'
					/>

					<Pagination
						page={page}
						totalPages={totalPages}
						onPageChange={next => updateParams({ pagina: String(next) })}
					/>
				</div>
			)}

			{activeTab === 'alertas' && (
				<div className='flex flex-col gap-3'>
					<h2 className='flex items-center gap-2 text-sm font-semibold text-neutral-900'>
						<FiAlertTriangle className='text-warning-500' />
						Alertas de stock bajo y vencimiento
					</h2>

					<DataTable
						columns={[
							{ key: 'product', header: 'Producto', render: item => item.productName },
							{
								key: 'stock',
								header: 'Stock',
								render: item => (
									<span>
										{item.stock} {item.unit}
										{item.stock <= LOW_STOCK_THRESHOLD && (
											<Badge variant='warning' className='ml-2'>
												Bajo
											</Badge>
										)}
									</span>
								),
							},
							{
								key: 'expiration',
								header: 'Vencimiento',
								render: item =>
									item.daysUntilExpiration !== null && item.daysUntilExpiration <= 30 ? (
										<span className='flex items-center gap-2'>
											{item.endDate ? formatDateLong(item.endDate) : '—'}
											<Badge variant={item.daysUntilExpiration < 0 ? 'danger' : 'warning'}>
												{item.daysUntilExpiration < 0
													? 'Vencido'
													: `En ${item.daysUntilExpiration} días`}
											</Badge>
										</span>
									) : (
										item.endDate ? formatDateLong(item.endDate) : '—'
									),
							},
						]}
						data={alerts}
						getRowId={item => item.productId}
						isLoading={isLoadingAlerts}
						emptyTitle='Sin alertas'
						emptyDescription='Ningún producto tiene stock bajo ni vencimiento próximo.'
					/>
				</div>
			)}

			{activeTab === 'historial' && (
				<div className='flex flex-col gap-3'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<h2 className='text-sm font-semibold text-neutral-900'>Historial de movimientos</h2>

						<Select
							aria-label='Filtrar historial por tipo'
							value={historyFilter}
							onChange={event => setHistoryFilter(event.target.value)}
							options={historyFilterOptions}
							containerClassName='w-full sm:w-64'
						/>
					</div>

					<DataTable
						columns={[
							{
								key: 'type',
								header: 'Tipo',
								render: entry => (
									<Badge variant={actionTypeVariant[entry.actionType] ?? 'neutral'}>
										{entry.actionType}
									</Badge>
								),
							},
							{ key: 'responsable', header: 'Responsable', render: entry => entry.userOrAdminUserName },
							{
								key: 'mensaje',
								header: 'Detalle',
								render: entry => (
									<pre className='whitespace-pre-wrap font-sans text-sm'>{entry.description}</pre>
								),
							},
							{
								key: 'fecha',
								header: 'Fecha',
								render: entry => formatDateLong(entry.createdAt),
							},
						]}
						data={filteredHistory}
						getRowId={entry => entry.id}
						isLoading={isLoadingHistory}
						emptyTitle='Sin movimientos'
						emptyDescription={
							historyFilter === 'all'
								? 'Todavía no hay historial de almacén registrado.'
								: 'No hay movimientos de este tipo.'
						}
					/>
				</div>
			)}

			<RegisterProductInModal
				isOpen={inModalOpen}
				onClose={closeIn}
				initialProductId={selectedProductId}
				isSubmitting={isRegisteringIn}
				onSubmit={input => registerIn(input, { onSuccess: closeIn })}
			/>

			<RegisterProductOutModal
				isOpen={outModalOpen}
				onClose={closeOut}
				initialProductId={selectedProductId}
				isSubmitting={isRegisteringOut}
				onSubmit={input => registerOut(input, { onSuccess: closeOut })}
			/>
		</div>
	);
};
