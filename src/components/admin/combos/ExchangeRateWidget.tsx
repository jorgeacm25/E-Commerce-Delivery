import { useState } from 'react';
import { Button, Input, Skeleton } from '../../ui';
import { useActiveExchangeRate, useUpdateExchangeRate } from '../../../hooks';
import { formatCup, formatDateLong } from '../../../helpers';

// Restyle de src/components/dashboard/combos/ExchangeRateWidget.tsx (legacy,
// sin enlazar) sobre el sistema de diseño nuevo. Misma lógica/hooks.
export const ExchangeRateWidget = () => {
	const { data: rate, isLoading } = useActiveExchangeRate();
	const { mutate, isPending } = useUpdateExchangeRate();

	const [nuevaTasa, setNuevaTasa] = useState('');

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!nuevaTasa) return;

		mutate(Number(nuevaTasa), { onSuccess: () => setNuevaTasa('') });
	};

	return (
		<div className='rounded-2xl border border-neutral-200 bg-white p-5 shadow-card'>
			<h3 className='mb-2 text-sm font-semibold text-neutral-900'>Tasa de cambio (CUP por USD)</h3>

			<div className='mb-3 text-sm text-neutral-600'>
				{isLoading
					? <Skeleton variant='text' className='w-64 max-w-full' />
					: rate
					? `Vigente: ${formatCup(rate.valor_cup_por_usd)} por 1 USD, desde ${formatDateLong(rate.vigente_desde)}`
					: 'Aún no hay una tasa configurada.'}
			</div>

			<form onSubmit={handleSubmit} className='flex items-end gap-2'>
				<Input
					label='Nueva tasa'
					type='number'
					step='0.01'
					min={0}
					value={nuevaTasa}
					onChange={event => setNuevaTasa(event.target.value)}
					containerClassName='flex-1'
				/>
				<Button type='submit' isLoading={isPending}>
					Actualizar
				</Button>
			</form>
		</div>
	);
};
