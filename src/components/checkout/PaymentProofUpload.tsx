import { useState } from 'react';
import { useActivePaymentAccount, useUploadPaymentProof } from '../../hooks';
import { ImSpinner2 } from 'react-icons/im';
import { CiCircleCheck } from 'react-icons/ci';

interface Props {
	orderId: number;
}

// El pago puede subirse ahora o más tarde (antes o después de la entrega),
// por eso este bloque nunca bloquea el flujo del pedido, solo lo acompaña.
export const PaymentProofUpload = ({ orderId }: Props) => {
	const { data: account, isLoading: isLoadingAccount } =
		useActivePaymentAccount();
	const { mutate, isPending, isSuccess } = useUploadPaymentProof();

	const [file, setFile] = useState<File | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!file || !account) return;

		mutate({
			orderId,
			paymentAccountId: account.id,
			file,
		});
	};

	if (isLoadingAccount) return null;

	if (!account) {
		return (
			<div className='border border-slate-200 w-full p-5 rounded-md text-sm'>
				<p>
					No hay una cuenta de cobro configurada en este momento.
					Nos pondremos en contacto contigo para coordinar el pago.
				</p>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className='border border-slate-200 w-full p-5 rounded-md space-y-2'>
				<div className='flex items-center gap-2 text-green-600'>
					<CiCircleCheck size={24} />
					<p className='font-medium'>
						Comprobante recibido, será revisado en breve
					</p>
				</div>
				<p className='text-sm text-gray-600'>
					Te avisaremos por WhatsApp en cuanto se confirme el pago.
				</p>
			</div>
		);
	}

	return (
		<div className='border border-slate-200 w-full p-5 rounded-md space-y-3'>
			<h3 className='font-medium'>Realiza tu pago</h3>

			<div className='bg-stone-100 text-sm p-4 rounded-md space-y-1'>
				<p className='font-semibold uppercase'>{account.tipo}</p>
				<p>Titular: {account.titular}</p>
				<p>Cuenta / correo: {account.referencia}</p>
			</div>

			<p className='text-sm text-gray-600'>
				Realiza el pago a la cuenta de arriba y sube una captura del
				comprobante. Puedes hacerlo ahora o más tarde desde el
				detalle de tu pedido.
			</p>

			<form onSubmit={handleSubmit} className='space-y-3'>
				<input
					type='file'
					accept='image/*'
					onChange={e => setFile(e.target.files?.[0] ?? null)}
					className='text-sm w-full'
				/>

				<button
					type='submit'
					disabled={!file || isPending}
					className='bg-black text-white py-3 px-5 text-sm font-semibold rounded-md disabled:opacity-40 flex items-center justify-center gap-2 w-full sm:w-auto'
				>
					{isPending && (
						<ImSpinner2 className='animate-spin' size={16} />
					)}
					Subir comprobante
				</button>
			</form>
		</div>
	);
};
