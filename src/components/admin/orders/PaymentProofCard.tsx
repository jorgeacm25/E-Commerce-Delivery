import { useState } from 'react';
import { PaymentProofWithOrder } from '../../../interfaces';
import { usePaymentProofSignedUrl, useReviewPaymentProof } from '../../../hooks';
import { formatDateLong, formatPrice } from '../../../helpers';
import { Button, ConfirmDialog, Input, Skeleton } from '../../ui';

// Restyle de src/components/dashboard/payments/PaymentProofCard.tsx (legacy,
// sin enlazar) sobre el sistema de diseño nuevo, con confirmación antes de
// confirmar/rechazar (acción sensible: cascada a orders.payment_status).
interface Props {
	proof: PaymentProofWithOrder;
}

export const PaymentProofCard = ({ proof }: Props) => {
	const { url, isLoading: isLoadingUrl } = usePaymentProofSignedUrl(proof.imagen_url);
	const { confirm, isConfirming, reject, isRejecting } = useReviewPaymentProof();

	const [nota, setNota] = useState('');
	const [pendingAction, setPendingAction] = useState<'confirm' | 'reject' | null>(null);

	const isBusy = isConfirming || isRejecting;

	const runPendingAction = () => {
		if (pendingAction === 'confirm') confirm({ proofId: proof.id, nota });
		if (pendingAction === 'reject') reject({ proofId: proof.id, nota });
		setPendingAction(null);
	};

	return (
		<div className='flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-card md:flex-row'>
			<div className='w-full shrink-0 md:w-56'>
				{isLoadingUrl ? (
					<Skeleton className='h-56 w-full' />
				) : (
					<a href={url} target='_blank' rel='noreferrer'>
						<img
							src={url}
							alt='Comprobante de pago'
							className='h-56 w-full rounded-lg border border-neutral-200 object-cover'
						/>
					</a>
				)}
			</div>

			<div className='flex-1 space-y-2 text-sm'>
				<div className='flex items-start justify-between'>
					<div>
						<p className='font-semibold text-neutral-900'>Pedido #{proof.order_id}</p>
						<p className='text-neutral-600'>
							{proof.orders?.customers?.full_name} — {proof.orders?.customers?.email}
						</p>
					</div>
					<p className='text-xs text-neutral-500'>{formatDateLong(proof.created_at)}</p>
				</div>

				<div className='flex flex-wrap gap-x-6 gap-y-1 text-neutral-700'>
					<p>
						<span className='font-medium'>Monto del pedido:</span>{' '}
						{proof.orders ? formatPrice(proof.orders.total_amount) : '—'}
					</p>
					<p>
						<span className='font-medium'>Cuenta usada:</span>{' '}
						{proof.payment_accounts
							? `${proof.payment_accounts.tipo.toUpperCase()} · ${proof.payment_accounts.referencia}`
							: '—'}
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
