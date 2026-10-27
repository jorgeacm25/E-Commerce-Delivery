import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import { Logo } from '../../components/layout';
import { Alert, Button, EmptyState, Skeleton } from '../../components/ui';
import { formatPrice } from '../../helpers';
import { useCustomerOrder, usePaymentAccounts, useUploadPaymentProof } from '../../hooks';
import { PaymentMethod } from '../../lib/checkoutValidators';

// El pedido ya se creó real contra el backend (api/order) al confirmar el
// checkout — acá solo se lee para mostrarlo. Si el método de pago elegido
// necesita verificación manual (todo menos "efectivo al recibir"), se
// ofrece subir el comprobante ahora o más tarde (desde /mi-cuenta/pedidos).
const METHODS_THAT_NEED_PROOF: PaymentMethod[] = ['zelle', 'bank_transfer', 'card_manual'];

export const OrderConfirmedPage = () => {
	const { orderNumber: orderId } = useParams<{ orderNumber: string }>();
	const location = useLocation();
	const paymentMethod = (location.state as { paymentMethod?: PaymentMethod } | null)?.paymentMethod;

	const { order, isLoading, isError } = useCustomerOrder(orderId);
	const { accounts, isLoading: isLoadingAccounts } = usePaymentAccounts();
	const { mutate: uploadProof, isPending, isSuccess } = useUploadPaymentProof();

	const [file, setFile] = useState<File | null>(null);

	const activeAccount = accounts.filter(account => account.activa).sort((a, b) => a.prioridad - b.prioridad)[0];
	const needsProof = paymentMethod ? METHODS_THAT_NEED_PROOF.includes(paymentMethod) : false;

	const handleUpload = (event: React.FormEvent) => {
		event.preventDefault();
		if (!file || !order) return;
		uploadProof({ orderId: order.id, paymentAccountId: activeAccount?.id, file });
	};

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
						Tu pedido fue recibido. Te avisaremos en cuanto se confirme el pago.
					</p>
				</div>

				{isLoading ? (
					<div className='flex w-full max-w-lg flex-col gap-3'>
						<Skeleton className='h-48 w-full rounded-2xl' />
					</div>
				) : isError || !order ? (
					<EmptyState
						title='No encontramos el detalle de este pedido'
						description='Puedes ver todos tus pedidos desde tu cuenta.'
					/>
				) : (
					<div className='flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-neutral-200 p-5'>
						<div className='text-sm text-neutral-600'>
							<p>
								<span className='font-medium text-neutral-900'>Pedido:</span> #{order.id.slice(0, 8)}
							</p>
							<p>
								<span className='font-medium text-neutral-900'>Dirección:</span> {order.addressLine1},{' '}
								{order.city}
							</p>
						</div>

						<ul className='flex flex-col gap-2 border-t border-neutral-200 pt-3 text-sm'>
							{order.items.map(item => (
								<li key={item.id} className='flex justify-between'>
									<span className='text-neutral-600'>
										{item.quantity} x {item.productName}
									</span>
									<span className='font-medium text-neutral-900'>
										{formatPrice(item.price * item.quantity)}
									</span>
								</li>
							))}
						</ul>

						<div className='flex justify-between border-t border-neutral-200 pt-3 text-base font-bold text-neutral-900'>
							<span>Total</span>
							<span>{formatPrice(order.totalAmount)}</span>
						</div>
					</div>
				)}

				{order && needsProof && !isLoadingAccounts && (
					<div className='w-full max-w-lg rounded-2xl border border-neutral-200 p-5'>
						{isSuccess ? (
							<Alert variant='success' title='Comprobante recibido'>
								Será revisado en breve. Te avisaremos en cuanto se confirme el pago.
							</Alert>
						) : !activeAccount ? (
							<Alert variant='info' title='Pago pendiente de coordinar'>
								Todavía no hay una cuenta de cobro configurada. Nos pondremos en contacto contigo
								para coordinar el pago.
							</Alert>
						) : (
							<form onSubmit={handleUpload} className='flex flex-col gap-3'>
								<h2 className='text-sm font-semibold text-neutral-900'>Sube tu comprobante de pago</h2>
								<div className='rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700'>
									<p className='font-semibold uppercase'>{activeAccount.tipo}</p>
									<p>Titular: {activeAccount.titular}</p>
									<p>Cuenta / correo: {activeAccount.referencia}</p>
								</div>
								<p className='text-sm text-neutral-500'>
									Puedes subirlo ahora o más tarde desde el detalle de tu pedido.
								</p>
								<input
									type='file'
									accept='image/*'
									onChange={event => setFile(event.target.files?.[0] ?? null)}
									className='text-sm'
								/>
								<Button type='submit' leftIcon={<FiUploadCloud />} isLoading={isPending} disabled={!file}>
									Subir comprobante
								</Button>
							</form>
						)}
					</div>
				)}

				<div className='flex flex-col items-center gap-2 sm:flex-row'>
					<Link to='/mi-cuenta/pedidos'>
						<Button variant='outline'>Ver mis pedidos</Button>
					</Link>
					<Link to='/'>
						<Button>Volver al inicio</Button>
					</Link>
				</div>
			</main>
		</div>
	);
};
