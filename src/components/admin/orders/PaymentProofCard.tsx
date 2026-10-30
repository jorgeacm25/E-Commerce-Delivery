import { useState } from 'react';
import { AdminOrder, AdminPaymentAccount, RealPaymentProof } from '../../../interfaces';
import { useReviewPaymentProof } from '../../../hooks';
import { formatDateLong, formatPrice } from '../../../helpers';
import { Button, ConfirmDialog, Input } from '../../ui';

interface Props {
	proof: RealPaymentProof;
	order?: AdminOrder;
	account?: AdminPaymentAccount;
}

export const PaymentProofCard = ({ proof, order, account }: Props) => {
	const { confirm, isConfirming, reject, isRejecting } = useReviewPaymentProof();

	const [nota, setNota] = useState('');
	const [pendingAction, setPendingAction] = useState<'confirm' | 'reject' | null>(null);

	const isBusy = isConfirming || isRejecting;

	const runPendingAction = () => {
		if (pendingAction === 'confirm') confirm({ proofId: proof.id, orderId: proof.orderId, nota });
		if (pendingAction === 'reject') reject({ proofId: proof.id, orderId: proof.orderId, nota });
		setPendingAction(null);
	};

	return (
		<div className='flex flex-col gap-3 rounded-2xl border border-neutral-300 bg-white p-4 shadow-card card-hover md:flex-row'>
			<div className='w-full shrink-0 md:w-56'>
				<a href={proof.imagenUrl} target='_blank' rel='noreferrer'>
					<img
						src={proof.imagenUrl}
						alt='Comprobante de pago'
						className='h-56 w-full rounded-lg border border-neutral-200 object-cover'
					/>
				</a>
			</div>

			<div className='flex-1 space-y-2 text-sm'>
				<div className='flex items-start justify-between'>
					<div>
						<p className='font-semibold text-neutral-900'>Pedido #{proof.orderId.slice(0, 8)}</p>
						<p className='text-neutral-600'>{order?.customerName ?? '—'} — {order?.customerEmail ?? '—'}</p>
					</div>
					<p className='text-xs text-neutral-500'>{proof.createdAt ? formatDateLong(proof.createdAt) : '—'}</p>
				</div>

				<div className='flex flex-wrap gap-x-6 gap-y-1 text-neutral-700'>
					<p>
						<span className='font-medium'>Monto del pedido:</span>{' '}
						{order ? formatPrice(order.totalAmount) : '—'}
					</p>
					<p>
						<span className='font-medium'>Cuenta usada:</span>{' '}
						{account ? `${account.tipo.toUpperCase()} · ${account.referencia}` : '—'}
					</p>
				</div>

				<Input
					placeholder='Nota (opcional)'
					value={nota}
					onChange={event => setNota(event.target.value)}
				/>

				<div className='flex gap-2'>
					<Button
						variant='primary'
						size='sm'
						disabled={isBusy}
						isLoading={isConfirming}
						onClick={() => setPendingAction('confirm')}
					>
						Confirmar
					</Button>
					<Button
						variant='danger'
						size='sm'
						disabled={isBusy}
						isLoading={isRejecting}
						onClick={() => setPendingAction('reject')}
					>
						Rechazar
					</Button>
				</div>
			</div>

			<ConfirmDialog
				isOpen={Boolean(pendingAction)}
				onClose={() => setPendingAction(null)}
				onConfirm={runPendingAction}
				title={pendingAction === 'confirm' ? '¿Confirmar este pago?' : '¿Rechazar este comprobante?'}
				description='Esta acción actualiza el estado de pago del pedido y no se puede deshacer desde aquí.'
				confirmLabel={pendingAction === 'confirm' ? 'Confirmar' : 'Rechazar'}
				variant={pendingAction === 'confirm' ? 'primary' : 'danger'}
			/>
		</div>
	);
};
