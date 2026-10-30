import toast from 'react-hot-toast';
import { FiCheck, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, CurrencyDisplay, EmptyState, PageHeader, Skeleton } from '../../components/ui';
import { cn } from '../../helpers';
import { useAuth, useCustomerOrder } from '../../hooks';
import { buildCartItem } from '../../helpers/catalog';
import { getCatalogProductBySlug } from '../../services/catalog.service';
import { CustomerOrder } from '../../interfaces';
import { useCartStore } from '../../store/cart.store';
import { useGlobalStore } from '../../store/global.store';

const STATUS_ORDER: CustomerOrder['status'][] = ['Pending', 'Paid', 'Shipped', 'Delivered'];
const STATUS_LABELS: Record<CustomerOrder['status'], string> = {
	Pending: 'Pedido recibido, pago pendiente de confirmación',
	Paid: 'Pago confirmado',
	Shipped: 'En camino al destinatario',
	Delivered: 'Entregado',
	Cancelled: 'Cancelado',
};

export const CustomerOrderDetailPage = () => {
	const { orderNumber: orderId } = useParams<{ orderNumber: string }>();
	const openSheet = useGlobalStore(state => state.openSheet);
	const { user } = useAuth();
	const addItem = useCartStore(state => state.addItem);

	const { order, isLoading, isError } = useCustomerOrder(orderId);
	// El backend no valida dueño en GET /api/order/{id} (ver TrackOrderPage) —
	// se refuerza acá: si el pedido existe pero no es del usuario autenticado,
	// se trata igual que "no encontrado".
	const belongsToUser = order && user && order.customerId === user.id;

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4'>
				<Skeleton className='h-8 w-64' />
				<Skeleton className='h-64 w-full rounded-2xl' />
			</div>
		);
	}

	if (isError || !belongsToUser) {
		return (
			<EmptyState
				icon={<FiPackage />}
				title='No encontramos ese pedido'
				description='Puede que el número sea incorrecto o que el pedido no esté asociado a tu cuenta.'
				action={
					<Link to='/mi-cuenta/pedidos' className='focus-ring text-sm font-semibold text-primary-700 hover:underline'>
						Volver a mis pedidos
					</Link>
				}
			/>
		);
	}

	const currentStageIndex = STATUS_ORDER.indexOf(order.status);
	const isCancelled = order.status === 'Cancelled';

	const handleRepeatOrder = async () => {
		let rejected = 0;
		let unavailable = 0;

		for (const item of order.items) {
			const product = await getCatalogProductBySlug(item.productId).catch(() => null);
			if (!product) {
				unavailable += 1;
				continue;
			}

			const result = addItem(buildCartItem(product, item.quantity), product.stock);
			if (!result.ok) rejected += 1;
		}

		if (unavailable > 0 || rejected > 0) {
			toast.error('Algunos productos ya no están disponibles o no tienen el stock necesario.', {
				position: 'bottom-right',
			});
		} else {
			toast.success('Pedido agregado al carrito', { position: 'bottom-right' });
		}

		openSheet('cart');
	};

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title={`Pedido #${order.id.slice(0, 8)}`}
				breadcrumb={[
					{ label: 'Inicio', href: '/' },
					{ label: 'Mis pedidos', href: '/mi-cuenta/pedidos' },
					{ label: `#${order.id.slice(0, 8)}` },
				]}
				actions={
					<Button leftIcon={<FiShoppingCart />} onClick={handleRepeatOrder}>
						Repetir pedido
					</Button>
				}
			/>

			<div className='grid gap-6 lg:grid-cols-3'>
				<div className='flex flex-col gap-6 lg:col-span-2'>
					<div className='rounded-2xl border border-neutral-200 p-5'>
						<h2 className='mb-3 text-sm font-semibold text-neutral-900'>Seguimiento</h2>
						{isCancelled ? (
							<Badge variant='danger'>{STATUS_LABELS.Cancelled}</Badge>
						) : (
							<ol className='flex flex-col gap-3'>
								{STATUS_ORDER.map((status, index) => {
									const isDone = index <= currentStageIndex;
									return (
										<li key={status} className='flex items-center gap-3'>
											<span
												className={cn(
													'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
													isDone ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'
												)}
											>
												{isDone ? <FiCheck aria-hidden='true' /> : index + 1}
											</span>
											<span className={cn('text-sm', isDone ? 'font-medium text-neutral-900' : 'text-neutral-500')}>
												{STATUS_LABELS[status]}
											</span>
										</li>
									);
								})}
							</ol>
						)}
					</div>

					<div className='rounded-2xl border border-neutral-200 p-5'>
						<h2 className='mb-3 text-sm font-semibold text-neutral-900'>Productos</h2>
						<ul className='flex flex-col divide-y divide-neutral-100'>
							{order.items.map(item => (
								<li key={item.id} className='flex items-center justify-between gap-4 py-3'>
									<div className='flex-1'>
										<p className='text-sm font-medium text-neutral-900'>{item.productName}</p>
										<p className='text-xs text-neutral-500'>x{item.quantity}</p>
									</div>
									<CurrencyDisplay usd={item.price * item.quantity} size='sm' />
								</li>
							))}
						</ul>
					</div>

					<div className='rounded-2xl border border-neutral-200 p-5'>
						<h2 className='mb-3 text-sm font-semibold text-neutral-900'>Dirección de entrega</h2>
						<p className='text-sm text-neutral-700'>{order.addressLine1}</p>
						{order.addressLine2 && <p className='text-sm text-neutral-500'>{order.addressLine2}</p>}
						<p className='text-sm text-neutral-500'>
							{order.city}, {order.state}, {order.country}
						</p>
					</div>
				</div>

				<div className='flex flex-col gap-2 rounded-2xl border border-neutral-200 p-5 lg:col-span-1'>
					<h2 className='mb-1 text-sm font-semibold text-neutral-900'>Resumen</h2>
					<div className='mt-2 flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900'>
						<span>Total</span>
						<CurrencyDisplay usd={order.totalAmount} size='md' />
					</div>
				</div>
			</div>
		</div>
	);
};
