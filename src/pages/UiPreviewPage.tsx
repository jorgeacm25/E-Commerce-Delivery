import { useState } from 'react';
import {
	FiCreditCard,
	FiHeart,
	FiHome,
	FiPackage,
	FiSettings,
	FiTrash2,
	FiTruck,
} from 'react-icons/fi';
import {
	Alert,
	Badge,
	Breadcrumb,
	Button,
	Checkbox,
	ConfirmDialog,
	CurrencyDisplay,
	DataTable,
	Drawer,
	Dropdown,
	EmptyState,
	ErrorState,
	FileUploader,
	IconButton,
	Input,
	Modal,
	OrderStatusBadge,
	PageHeader,
	Pagination,
	PasswordInput,
	ProductCard,
	QuantitySelector,
	RadioGroup,
	SearchInput,
	Select,
	Skeleton,
	StatCard,
	Switch,
	Tabs,
	Textarea,
	Tooltip,
	showErrorToast,
	showSuccessToast,
} from '../components/ui';

interface SectionProps {
	title: string;
	children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
	<section className='flex flex-col gap-4 border-b border-neutral-200 pb-10'>
		<h2 className='text-lg font-bold text-neutral-900'>{title}</h2>
		<div className='flex flex-wrap items-start gap-4'>{children}</div>
	</section>
);

interface FakeOrder {
	id: number;
	customer: string;
	status: string;
	total: number;
}

const fakeOrders: FakeOrder[] = [
	{ id: 1, customer: 'María Pérez', status: 'Pending', total: 42.5 },
	{ id: 2, customer: 'Carlos Ruiz', status: 'Paid', total: 18.9 },
	{ id: 3, customer: 'Ana Gómez', status: 'Delivered', total: 63.2 },
];

export const UiPreviewPage = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [checked, setChecked] = useState(true);
	const [radioValue, setRadioValue] = useState('cash');
	const [tabValue, setTabValue] = useState('details');
	const [quantity, setQuantity] = useState(1);
	const [page, setPage] = useState(3);
	const [search, setSearch] = useState('');
	const [file, setFile] = useState<File | null>(null);

	return (
		<div className='flex flex-col gap-10'>
			<PageHeader
				title='Sistema de diseño'
				description='Vista temporal para revisar todos los componentes reutilizables. Ruta de desarrollo, no forma parte de la navegación pública.'
				breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'UI Preview' }]}
			/>

			<Section title='Button'>
				<Button variant='primary'>Primario</Button>
				<Button variant='secondary'>Secundario</Button>
				<Button variant='outline'>Outline</Button>
				<Button variant='ghost'>Ghost</Button>
				<Button variant='danger'>Peligro</Button>
				<Button isLoading>Cargando</Button>
				<Button disabled>Deshabilitado</Button>
				<Button size='sm'>Pequeño</Button>
				<Button size='lg'>Grande</Button>
			</Section>

			<Section title='IconButton'>
				<IconButton icon={<FiHeart />} label='Favorito' variant='primary' />
				<IconButton icon={<FiSettings />} label='Ajustes' variant='outline' />
				<IconButton icon={<FiTrash2 />} label='Eliminar' variant='danger' />
				<IconButton icon={<FiHome />} label='Cargando' isLoading />
			</Section>

			<Section title='Input, PasswordInput, Textarea, Select'>
				<Input label='Nombre completo' placeholder='Escribe tu nombre' className='w-64' />
				<Input
					label='Correo'
					placeholder='correo@ejemplo.com'
					error='Correo inválido'
					className='w-64'
				/>
				<PasswordInput label='Contraseña' placeholder='••••••••' className='w-64' />
				<Textarea label='Notas del pedido' placeholder='Instrucciones de entrega' className='w-64' />
				<Select
					label='Método de entrega'
					placeholder='Selecciona una opción'
					options={[
						{ value: 'domicilio', label: 'A domicilio' },
						{ value: 'recogida', label: 'Recogida en tienda' },
					]}
					className='w-64'
				/>
			</Section>

			<Section title='Checkbox, RadioGroup, Switch'>
				<Checkbox
					label='Recibir notificaciones'
					description='Te avisaremos del estado de tu pedido'
					checked={checked}
					onChange={e => setChecked(e.target.checked)}
				/>
				<RadioGroup
					label='Forma de pago'
					value={radioValue}
					onChange={setRadioValue}
					options={[
						{ value: 'cash', label: 'Efectivo' },
						{ value: 'zelle', label: 'Zelle' },
						{ value: 'paypal', label: 'PayPal' },
					]}
				/>
				<Switch label='Modo mantenimiento' checked={checked} onChange={setChecked} />
			</Section>

			<Section title='Modal, Drawer, Dropdown, Tabs, Tooltip'>
				<Button onClick={() => setIsModalOpen(true)}>Abrir modal</Button>
				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					title='Confirmar pedido'
					description='Revisa los datos antes de continuar'
					footer={
						<>
							<Button variant='outline' onClick={() => setIsModalOpen(false)}>
								Cancelar
							</Button>
							<Button onClick={() => setIsModalOpen(false)}>Confirmar</Button>
						</>
					}
				>
					<p className='text-sm text-neutral-600'>Contenido de ejemplo dentro del modal.</p>
				</Modal>

				<Button onClick={() => setIsDrawerOpen(true)}>Abrir drawer</Button>
				<Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title='Carrito'>
					<p className='text-sm text-neutral-600'>Contenido de ejemplo dentro del drawer.</p>
				</Drawer>

				<Dropdown
					trigger={<Button variant='outline'>Acciones</Button>}
					items={[
						{ value: 'edit', label: 'Editar' },
						{ value: 'delete', label: 'Eliminar', danger: true },
					]}
					onSelect={() => {}}
				/>

				<Tooltip content='Información adicional'>
					<Button variant='ghost'>Con tooltip</Button>
				</Tooltip>
			</Section>

			<Section title='Tabs'>
				<Tabs
					tabs={[
						{ value: 'details', label: 'Detalles' },
						{ value: 'shipping', label: 'Envío' },
						{ value: 'payments', label: 'Pagos' },
					]}
					value={tabValue}
					onChange={setTabValue}
				/>
			</Section>

			<Section title='Breadcrumb, Pagination'>
				<Breadcrumb
					items={[
						{ label: 'Dashboard', href: '/dashboard' },
						{ label: 'Pedidos', href: '/dashboard/ordenes' },
						{ label: 'Pedido #1024' },
					]}
				/>
				<Pagination page={page} totalPages={12} onPageChange={setPage} />
			</Section>

			<Section title='Badge, OrderStatusBadge'>
				<Badge variant='neutral'>Neutral</Badge>
				<Badge variant='primary'>Primario</Badge>
				<Badge variant='secondary'>Secundario</Badge>
				<Badge variant='success'>Éxito</Badge>
				<Badge variant='warning'>Advertencia</Badge>
				<Badge variant='danger'>Peligro</Badge>
				<OrderStatusBadge status='Pending' />
				<OrderStatusBadge status='Paid' />
				<OrderStatusBadge status='Shipped' />
				<OrderStatusBadge status='Delivered' />
			</Section>

			<Section title='Alert'>
				<Alert variant='info' title='Información' className='w-full sm:w-96'>
					La tasa de cambio se actualizó hace 2 horas.
				</Alert>
				<Alert variant='success' title='Pago confirmado' className='w-full sm:w-96'>
					El comprobante fue verificado correctamente.
				</Alert>
				<Alert variant='warning' title='Stock bajo' className='w-full sm:w-96'>
					Quedan menos de 5 unidades disponibles.
				</Alert>
				<Alert variant='danger' title='Error' onClose={() => {}} className='w-full sm:w-96'>
					No se pudo procesar el pedido.
				</Alert>
			</Section>

			<Section title='Toast'>
				<Button onClick={() => showSuccessToast('Producto añadido al carrito')}>
					Mostrar toast de éxito
				</Button>
				<Button variant='danger' onClick={() => showErrorToast('No se pudo completar la acción')}>
					Mostrar toast de error
				</Button>
			</Section>

			<Section title='Skeleton'>
				<div className='flex w-64 flex-col gap-2'>
					<Skeleton variant='circle' className='h-12 w-12' />
					<Skeleton variant='text' />
					<Skeleton variant='text' className='w-2/3' />
				</div>
			</Section>

			<Section title='EmptyState, ErrorState'>
				<EmptyState
					icon={<FiPackage />}
					title='No hay pedidos todavía'
					description='Cuando recibas un pedido aparecerá aquí'
					className='w-full sm:w-96'
				/>
				<ErrorState onRetry={() => {}} className='w-full sm:w-96' />
			</Section>

			<Section title='ConfirmDialog'>
				<Button variant='danger' onClick={() => setIsConfirmOpen(true)}>
					Eliminar producto
				</Button>
				<ConfirmDialog
					isOpen={isConfirmOpen}
					onClose={() => setIsConfirmOpen(false)}
					onConfirm={() => setIsConfirmOpen(false)}
					title='¿Eliminar producto?'
					description='Esta acción no se puede deshacer.'
					variant='danger'
					confirmLabel='Eliminar'
				/>
			</Section>

			<Section title='PageHeader'>
				<PageHeader
					title='Pedidos'
					description='Gestiona los pedidos de tus clientes'
					actions={<Button leftIcon={<FiTruck />}>Nuevo pedido</Button>}
					className='w-full'
				/>
			</Section>

			<Section title='StatCard'>
				<StatCard label='Ventas de hoy' value='$482.30' icon={<FiCreditCard />} trend='up' trendLabel='+12% vs ayer' />
				<StatCard label='Pedidos pendientes' value='7' trend='down' trendLabel='-2 vs ayer' />
				<StatCard label='Cargando' value='' isLoading />
			</Section>

			<Section title='CurrencyDisplay, QuantitySelector'>
				<CurrencyDisplay usd={24.99} />
				<QuantitySelector quantity={quantity} onChange={setQuantity} min={1} max={10} />
			</Section>

			<Section title='ProductCard'>
				<ProductCard
					image='/img/img-banner.jpg'
					name='Combo familiar de alimentos'
					price={35.5}
					onAdd={() => showSuccessToast('Combo añadido')}
					className='w-56'
				/>
				<ProductCard
					image='/img/img-banner.jpg'
					name='Combo agotado'
					price={20}
					inStock={false}
					onAdd={() => {}}
					className='w-56'
				/>
			</Section>

			<Section title='FileUploader'>
				<FileUploader
					label='Comprobante de pago'
					accept='image/*'
					hint='Formatos permitidos: JPG, PNG'
					file={file}
					onFileSelect={setFile}
					className='w-full sm:w-96'
				/>
			</Section>

			<Section title='SearchInput'>
				<SearchInput
					value={search}
					onChange={e => setSearch(e.target.value)}
					onClear={() => setSearch('')}
					placeholder='Buscar productos...'
					className='w-full sm:w-96'
				/>
			</Section>

			<Section title='DataTable'>
				<DataTable
					className='w-full'
					columns={[
						{ key: 'id', header: 'ID', render: row => `#${row.id}` },
						{ key: 'customer', header: 'Cliente', render: row => row.customer },
						{
							key: 'status',
							header: 'Estado',
							render: row => <OrderStatusBadge status={row.status} />,
						},
						{
							key: 'total',
							header: 'Total',
							render: row => <CurrencyDisplay usd={row.total} size='sm' />,
						},
					]}
					data={fakeOrders}
					getRowId={row => row.id}
				/>
			</Section>
		</div>
	);
};
