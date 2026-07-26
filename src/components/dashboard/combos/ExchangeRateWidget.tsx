import { useState } from 'react';
import { useActiveExchangeRate, useUpdateExchangeRate } from '../../../hooks';
import { formatDateLong } from '../../../helpers';
import { ImSpinner2 } from 'react-icons/im';

export const ExchangeRateWidget = () => {
	const { data: rate, isLoading } = useActiveExchangeRate();
	const { mutate, isPending } = useUpdateExchangeRate();

	const [nuevaTasa, setNuevaTasa] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!nuevaTasa) return;

		mutate(Number(nuevaTasa), {
			onSuccess: () => setNuevaTasa(''),
		});
	};

	return (
		<div className='border border-slate-200 rounded-md p-5 space-y-3'>
			<h3 className='font-semibold'>Tasa de cambio (CUP por USD)</h3>

			{isLoading ? (
				<p className='text-sm text-gray-600'>Cargando...</p>
			) : rate ? (
				<p className='text-sm text-gray-600'>
					Vigente: <span className='font-medium'>{rate.valor_cup_por_usd} CUP</span>{' '}
					por 1 USD, desde {formatDateLong(rate.vigente_desde)}
				</p>
			) : (
				<p className='text-sm text-gray-600'>
					Aún no hay una tasa configurada.
				</p>
			)}

			<form onSubmit={handleSubmit} className='flex gap-2'>
				<input
					type='number'
					step='0.01'
					placeholder='Nueva tasa'
					value={nuevaTasa}
					onChange={e => setNuevaTasa(e.target.value)}
					className='border border-slate-200 rounded-md p-2 text-sm flex-1'
				/>
				<button
					type='submit'
					disabled={isPending}
					className='bg-black text-white text-sm font-semibold px-4 rounded-md disabled:opacity-40 flex items-center gap-2'
				>
					{isPending && (
						<ImSpinner2 className='animate-spin' size={16} />
					)}
					Actualizar
				</button>
			</form>
		</div>
	);
};
