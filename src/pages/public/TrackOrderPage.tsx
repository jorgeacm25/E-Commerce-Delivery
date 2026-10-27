import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiCheck, FiSearch } from 'react-icons/fi';
import { Alert, Badge, Button, Input, PageHeader } from '../../components/ui';
import { cn } from '../../helpers';
import { useAuth } from '../../hooks';
import { getOrderById } from '../../services/order.service';
import { CustomerOrder } from '../../interfaces';

// Rastreo real contra el backend (api/order/{id}) — reemplaza el rastreo
// simulado por temporizador. El backend no valida que el pedido pertenezca
// a quien pregunta (ver OrderController.GetById), así que la comprobación
// de dueño se hace acá como defensa en profundidad; la corrección real
// (que el backend la exija) queda pendiente como deuda técnica.
const STATUS_ORDER: CustomerOrder['status'][] = ['Pending', 'Paid', 'Shipped', 'Delivered'];
const STATUS_LABELS: Record<CustomerOrder['status'], string> = {
	Pending: 'Pedido recibido, pago pendiente de confirmación',
	Paid: 'Pago confirmado',
	Shipped: 'En camino al destinatario',
	Delivered: 'Entregado',
	Cancelled: 'Cancelado',
};

export const TrackOrderPage = () => {
	const [searchParams] = useSearchParams();
	const { user } = useAuth();
	const [orderId, setOrderId] = useState(searchParams.get('numero') ?? '');
	const [order, setOrder] = useState<CustomerOrder | null>(null);
	const [notFound, setNotFound] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!orderId.trim()) {
			setOrder(null);
			setNotFound(false);
			return;
		}

		setIsSearching(true);
		try {
			const found = await getOrderById(orderId.trim());
			const belongsToUser = user && found.customerId === user.id;
			setOrder(belongsToUser ? found : null);
			setNotFound(!belongsToUser);
		} catch {
			setOrder(null);
			setNotFound(true);
		} finally {
			setIsSearching(false);
		}
	};

	const currentStageIndex = order ? STATUS_ORDER.indexOf(order.status) : -1;
	const isCancelled = order?.status === 'Cancelled';

	return (
		<div className='container flex flex-col gap-8 py-8'>
			<PageHeader
				title='Rastrear pedido'
				description='Ingresa el número de tu pedido para ver su estado.'
				breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Rastrear pedido' }]}
			/>

			<form onSubmit={handleSubmit} className='flex max-w-md flex-col gap-4'>
				<Input
					label='Número de pedido'
					value={orderId}
					onChange={e => setOrderId(e.target.value)}
					leftIcon={<FiSearch />}
				/>
				<Button type='submit' isLoading={isSearching}>
					Buscar pedido
				</Button>
			</form>

			{notFound && (
				<Alert variant='danger' title='No encontramos ese pedido' className='max-w-md'>
					Verifica el número e inténtalo de nuevo, o revísalo desde tu cuenta.
				</Alert>
			)}

			{order && (
				<div className='flex max-w-md flex-col gap-4 rounded-2xl border border-neutral-200 p-5'>
					<div>
						<p className='text-sm text-neutral-500'>Pedido</p>
						<p className='text-lg font-bold text-neutral-900'>#{order.id.slice(0, 8)}</p>
					</div>

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
										<span
											className={cn(
												'text-sm',
												isDone ? 'font-medium text-neutral-900' : 'text-neutral-500'
											)}
										>
											{STATUS_LABELS[status]}
										</span>
									</li>
								);
							})}
						</ol>
					)}
				</div>
			)}
		</div>
	);
};
