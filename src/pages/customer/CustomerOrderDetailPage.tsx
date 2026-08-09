import toast from 'react-hot-toast';
import { FiCheck, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, CurrencyDisplay, EmptyState, PageHeader } from '../../components/ui';
import { cn } from '../../helpers';
import { useAuth } from '../../hooks';
import {
	ORDER_TRACKING_STAGE_LABELS,
	ORDER_TRACKING_STAGE_ORDER,
	computeTrackingStage,
	getSimulatedOrder,
} from '../../services/checkoutSimulation.service';
import { useCartStore } from '../../store/cart.store';

export const CustomerOrderDetailPage = () => {
	const { orderNumber } = useParams<{ orderNumber: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const addItem = useCartStore(state => state.addItem);

	const order = orderNumber ? getSimulatedOrder(orderNumber) : null;
	// Nunca confiar solo en la URL: si el pedido existe pero no pertenece al
	// usuario autenticado, se trata igual que "no encontrado".
	const belongsToUser = order && user && order.userId === user.id;

	if (!belongsToUser) {
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

	const currentStage = computeTrackingStage(order);
	const currentStageIndex = ORDER_TRACKING_STAGE_ORDER.indexOf(currentStage);

	const handleRepeatOrder = () => {
		let rejected = 0;

		for (const item of order.items) {
			const result = addItem({
				variantId: item.variantId,
				productId: item.variantId,
				name: item.name,
				variantLabel: item.variantLabel,
				image: item.image,
				price: item.price,
				quantity: item.quantity,
				comboName: item.comboName,
			});

			if (!result.ok) rejected += 1;
		}

		if (rejected > 0) {
			toast.error('Algunos productos ya no tienen el stock necesario y no se agregaron.', {
				position: 'bottom-right',
			});
		} else {
			toast.success('Pedido agregado al carrito', { position: 'bottom-right' });
		}

		navigate('/carrito');
	};

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title={`Pedido #${order.orderNumber}`}
				breadcrumb={[
					{ label: 'Inicio', href: '/' },
					{ label: 'Mis pedidos', href: '/mi-cuenta/pedidos' },
					{ label: `#${order.orderNumber}` },
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
						<ol className='flex flex-col gap-3'>
							{ORDER_TRACKING_STAGE_ORDER.map((stage, index) => {
								const isDone = index <= currentStageIndex;
								return (
									<li key={stage} className='flex items-center gap-3'>
										<span
											className={cn(
												'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
												isDone ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'
											)}
										>
											{isDone ? <FiCheck aria-hidden='true' /> : index + 1}
										</span>
										<span className={cn('text-sm', isDone ? 'font-medium text-neutral-900' : 'text-neutral-500')}>
											{ORDER_TRACKING_STAGE_LABELS[stage]}
										</span>
									</li>
								);
							})}
						</ol>
					</div>

					<div className='rounded-2xl border border-neutral-200 p-5'>
						<h2 className='mb-3 text-sm font-semibold text-neutral-900'>Productos</h2>
						<ul className='flex flex-col divide-y divide-neutral-100'>
							{order.items.map(item => (
								<li key={`${item.variantId}-${item.comboName ?? ''}`} className='flex items-center gap-4 py-3'>
									<img src={item.image} alt={item.name} className='h-14 w-14 rounded-lg object-contain' />
									<div className='flex-1'>
										<p className='text-sm font-medium text-neutral-900'>{item.name}</p>
										<p className='text-xs text-neutral-500'>
											{item.variantLabel} · x{item.quantity}
										</p>
										{item.comboName && <Badge variant='secondary'>Combo: {item.comboName}</Badge>}
									</div>
									<CurrencyDisplay usd={item.price * item.quantity} size='sm' />
								</li>
							))}
						</ul>
					</div>

					<div className='rounded-2xl border border-neutral-200 p-5'>
						<h2 className='mb-3 text-sm font-semibold text-neutral-900'>Destinatario y dirección</h2>
						<p className='text-sm text-neutral-700'>{order.recipient.fullName}</p>
						<p className='text-sm text-neutral-500'>{order.recipient.phone}</p>
						<p className='mt-2 text-sm text-neutral-700'>{order.address.addressLine1}</p>
						{order.address.addressLine2 && (
							<p className='text-sm text-neutral-500'>{order.address.addressLine2}</p>
						)}
					</div>
				</div>

				<div className='flex flex-col gap-2 rounded-2xl border border-neutral-200 p-5 lg:col-span-1'>
					<h2 className='mb-1 text-sm font-semibold text-neutral-900'>Resumen</h2>
					<div className='flex justify-between text-sm text-neutral-600'>
						<span>Subtotal</span>
						<CurrencyDisplay usd={order.totals.subtotal} size='sm' />
					</div>
					{order.totals.discount > 0 && (
						<div className='flex justify-between text-sm text-success-700'>
							<span>Descuento</span>
							<span>
								-<CurrencyDisplay usd={order.totals.discount} size='sm' />
							</span>
						</div>
					)}
					<div className='flex justify-between text-sm text-neutral-600'>
						<span>Entrega</span>
						<CurrencyDisplay usd={order.totals.deliveryCost} size='sm' />
					</div>
					<div className='mt-2 flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900'>
						<span>Total</span>
						<CurrencyDisplay usd={order.totals.total} size='md' />
					</div>
				</div>
			</div>
		</div>
	);
};
