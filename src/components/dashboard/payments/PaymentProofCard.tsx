import { PaymentProofWithOrder } from '../../../interfaces';
import { usePaymentProofSignedUrl } from '../../../hooks';
import { useReviewPaymentProof } from '../../../hooks';
import { formatPrice, formatDateLong } from '../../../helpers';
import { useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';

interface Props {
	proof: PaymentProofWithOrder;
}

export const PaymentProofCard = ({ proof }: Props) => {
	const { url, isLoading: isLoadingUrl } = usePaymentProofSignedUrl(
		proof.imagen_url
	);
	const { confirm, isConfirming, reject, isRejecting } =
		useReviewPaymentProof();

	const [nota, setNota] = useState('');

	const isBusy = isConfirming || isRejecting;

	return (
		<div className='border border-slate-200 rounded-md p-4 flex flex-col gap-3 md:flex-row'>
			<div className='w-full md:w-[220px] shrink-0'>
				{isLoadingUrl ? (
					<div className='bg-stone-100 h-[220px] rounded-md animate-pulse' />
				) : (
					<a href={url} target='_blank' rel='noreferrer'>
						<img
							src={url}
							alt='Comprobante de pago'
							className='w-full h-[220px] object-cover rounded-md border border-slate-200'
						/>
					</a>
				)}
			</div>

			<div className='flex-1 space-y-2 text-sm'>
				<div className='flex justify-between items-start'>
					<div>
						<p className='font-semibold'>
							Pedido #{proof.order_id}
						</p>
						<p className='text-gray-600'>
							{proof.orders?.customers?.full_name} —{' '}
							{proof.orders?.customers?.email}
						</p>
					</div>
					<p className='text-gray-500 text-xs'>
						{formatDateLong(proof.created_at)}
					</p>
				</div>

				<div className='flex flex-wrap gap-x-6 gap-y-1'>
					<p>
						<span className='font-medium'>Monto del pedido:</span>{' '}
						{proof.orders
							? formatPrice(proof.orders.total_amount)
							: '—'}
					</p>
					<p>
						<span className='font-medium'>Cuenta usada:</span>{' '}
						{proof.payment_accounts
							? `${proof.payment_accounts.tipo.toUpperCase()} · ${
									proof.payment_accounts.referencia
							  }`
							: '—'}
					</p>
				</div>

				<input
					type='text'
					placeholder='Nota (opcional)'
					value={nota}
					onChange={e => setNota(e.target.value)}
					className='border border-slate-200 rounded-md p-2 text-sm w-full'
				/>

				<div className='flex gap-3'>
					<button
						disabled={isBusy}
						onClick={() =>
							confirm({ proofId: proof.id, nota })
						}
						className='bg-green-600 text-white text-xs font-semibold uppercase tracking-wide py-2 px-4 rounded-md disabled:opacity-40 flex items-center gap-2'
					>
						{isConfirming && (
							<ImSpinner2 className='animate-spin' size={14} />
						)}
						Confirmar
					</button>

					<button
						disabled={isBusy}
						onClick={() => reject({ proofId: proof.id, nota })}
						className='bg-red-500 text-white text-xs font-semibold uppercase tracking-wide py-2 px-4 rounded-md disabled:opacity-40 flex items-center gap-2'
					>
						{isRejecting && (
							<ImSpinner2 className='animate-spin' size={14} />
						)}
						Rechazar
					</button>
				</div>
			</div>
		</div>
	);
};
