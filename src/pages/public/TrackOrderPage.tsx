import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiCheck, FiSearch } from 'react-icons/fi';
import { Alert, Button, Input, PageHeader } from '../../components/ui';
import { cn } from '../../helpers';
import { SimulatedOrder } from '../../interfaces';
import {
	ORDER_TRACKING_STAGE_LABELS,
	ORDER_TRACKING_STAGE_ORDER,
	computeTrackingStage,
	getSimulatedOrder,
} from '../../services/checkoutSimulation.service';

// Rastreo simulado: el "estado" del pedido se calcula a partir del tiempo
// transcurrido desde que se creó (ver computeTrackingStage), ya que no hay
// backend real que actualice el estado del pedido en esta fase del proyecto.
export const TrackOrderPage = () => {
	const [searchParams] = useSearchParams();
	const [orderNumber, setOrderNumber] = useState(searchParams.get('numero') ?? '');
	const [order, setOrder] = useState<SimulatedOrder | null>(null);
	const [notFound, setNotFound] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!orderNumber.trim()) {
			setOrder(null);
			setNotFound(false);
			return;
		}

		const found = getSimulatedOrder(orderNumber);
		setOrder(found);
		setNotFound(!found);
	};

	const currentStage = order ? computeTrackingStage(order) : null;
	const currentStageIndex = currentStage ? ORDER_TRACKING_STAGE_ORDER.indexOf(currentStage) : -1;

	return (
		<div className='container flex flex-col gap-8 py-8'>
			<PageHeader
				title='Rastrear pedido'
				description='Ingresa tu número de pedido para ver su estado.'
				breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Rastrear pedido' }]}
			/>

			<form onSubmit={handleSubmit} className='flex max-w-md flex-col gap-4'>
				<Input
					label='Número de pedido'
					placeholder='Ej. DH-123456'
					value={orderNumber}
					onChange={e => setOrderNumber(e.target.value)}
					leftIcon={<FiSearch />}
				/>
				<Button type='submit'>Buscar pedido</Button>
			</form>

			{notFound && (
				<Alert variant='danger' title='No encontramos ese pedido' className='max-w-md'>
					Verifica el número e inténtalo de nuevo.
				</Alert>
			)}

			{order && currentStage && (
				<div className='flex max-w-md flex-col gap-4 rounded-2xl border border-neutral-200 p-5'>
					<div>
						<p className='text-sm text-neutral-500'>Pedido</p>
						<p className='text-lg font-bold text-neutral-900'>#{order.orderNumber}</p>
					</div>

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
									<span
										className={cn(
											'text-sm',
											isDone ? 'font-medium text-neutral-900' : 'text-neutral-500'
										)}
									>
										{ORDER_TRACKING_STAGE_LABELS[stage]}
									</span>
								</li>
							);
						})}
					</ol>
				</div>
			)}
		</div>
	);
};
