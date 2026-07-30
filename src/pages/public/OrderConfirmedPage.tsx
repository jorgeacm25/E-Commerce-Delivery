import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { Logo } from '../../components/layout';
import { Button, EmptyState } from '../../components/ui';
import { formatPrice } from '../../helpers';
import { getSimulatedOrder } from '../../services/checkoutSimulation.service';

export const OrderConfirmedPage = () => {
	const { orderNumber } = useParams<{ orderNumber: string }>();
	const order = orderNumber ? getSimulatedOrder(orderNumber) : null;

	return (
		<div className='flex min-h-screen flex-col'>
			<header className='border-b border-neutral-200 py-4'>
				<div className='container'>
					<Logo />
				</div>
			</header>

			<main className='container flex flex-1 flex-col items-center gap-6 py-10'>
				<div className='flex flex-col items-center gap-3 text-center'>
					<span className='flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-3xl text-success-600'>
						<FiCheckCircle aria-hidden='true' />
					</span>

					<h1 className='text-2xl font-bold text-neutral-900'>¡Pedido confirmado!</h1>
					<p className='text-neutral-600'>
						Tu pedido <span className='font-semibold'>#{orderNumber}</span> fue recibido. Te
						avisaremos en cuanto se confirme el pago.
					</p>
				</div>

				{order ? (
					<div className='flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-neutral-200 p-5'>
						<div className='text-sm text-neutral-600'>
							<p>
								<span className='font-medium text-neutral-900'>Destinatario:</span>{' '}
								{order.recipient.fullName}
							</p>
							<p>
								<span className='font-medium text-neutral-900'>Dirección:</span>{' '}
								{order.address.addressLine1}, {order.location.municipality}
							</p>
						</div>

						<ul className='flex flex-col gap-2 border-t border-neutral-200 pt-3 text-sm'>
							{order.items.map(item => (
								<li key={`${item.variantId}-${item.name}`} className='flex justify-between'>
									<span className='text-neutral-600'>
										{item.quantity} x {item.name}
									</span>
									<span className='font-medium text-neutral-900'>
										{formatPrice(item.price * item.quantity)}
									</span>
								</li>
							))}
						</ul>

						<div className='flex justify-between border-t border-neutral-200 pt-3 text-base font-bold text-neutral-900'>
							<span>Total</span>
							<span>{formatPrice(order.totals.total)}</span>
						</div>
					</div>
				) : (
					<EmptyState
						title='No encontramos el detalle de este pedido'
						description='Puede que el navegador haya borrado los datos temporales. Igualmente puedes rastrear tu pedido con el número de arriba.'
					/>
				)}

				<div className='flex flex-col items-center gap-2 sm:flex-row'>
					<Link to={`/rastrear-pedido?numero=${orderNumber ?? ''}`}>
						<Button variant='outline'>Rastrear mi pedido</Button>
					</Link>
					<Link to='/'>
						<Button>Volver al inicio</Button>
					</Link>
				</div>
			</main>
		</div>
	);
};
