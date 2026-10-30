import { useEffect } from 'react';
import Decimal from 'decimal.js';
import { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input, RadioGroup, Switch } from '../../ui';
import { ProductFormValues } from '../../../lib/adminProductValidators';
import { useActiveExchangeRate } from '../../../hooks';
import { formatPrice } from '../../../helpers';

interface Props {
	register: UseFormRegister<ProductFormValues>;
	watch: UseFormWatch<ProductFormValues>;
	setValue: UseFormSetValue<ProductFormValues>;
	errors: FieldErrors<ProductFormValues>;
}

// Fórmula confirmada: precio_usd = (costo_cup / tasa_vigente) + margen_usd
// (margen como monto fijo en USD, no porcentaje). Ver docs/PROJECT_STATE.md,
// sección Fase B admin.
const computeAutoPriceUsd = (costCup: number, marginUsd: number, valorCupPorUsd: number) =>
	new Decimal(costCup).dividedBy(valorCupPorUsd).plus(marginUsd).toDecimalPlaces(2).toNumber();

// RHF `watch()` refleja el valor crudo del input (string, incl. '' vacío)
// antes de que el resolver de Zod lo coerza a number — a pesar de que el
// tipo de ProductFormValues diga `number | undefined`. Sin este guard,
// Decimal.js revienta con un input vacío o no numérico mientras el usuario
// todavía está escribiendo.
const toFiniteNumber = (value: unknown): number | null => {
	if (value === undefined || value === null || value === '') return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
};

export const PricingModeFields = ({ register, watch, setValue, errors }: Props) => {
	const { data: exchangeRate } = useActiveExchangeRate();
	const pricingMode = watch('pricingMode');
	const costCup = watch('costCup');
	const marginUsd = watch('marginUsd');
	const hasDiscount = watch('hasDiscount');
	const priceUsd = watch('priceUsd');

	const rate = exchangeRate?.valor_cup_por_usd;

	useEffect(() => {
		if (pricingMode !== 'auto' || !rate) return;

		const parsedCost = toFiniteNumber(costCup);
		const parsedMargin = toFiniteNumber(marginUsd);
		if (parsedCost === null || parsedMargin === null) return;

		setValue('priceUsd', computeAutoPriceUsd(parsedCost, parsedMargin, rate), {
			shouldValidate: true,
		});
	}, [pricingMode, costCup, marginUsd, rate, setValue]);

	return (
		<div className='flex flex-col gap-4 rounded-xl border border-neutral-300 bg-white p-4'>
			<RadioGroup
				label='Modo de precio'
				name='pricingMode'
				value={pricingMode}
				onChange={value => setValue('pricingMode', value as 'fixed' | 'auto')}
				options={[
					{ value: 'fixed', label: 'Precio fijo en USD' },
					{ value: 'auto', label: 'Calcular automático (costo CUP + margen)' },
				]}
			/>

			{pricingMode === 'fixed' ? (
				<div className='grid gap-4 sm:grid-cols-2'>
					<Input
						label='Precio (USD)'
						type='number'
						step='0.01'
						min={0}
						error={errors.priceUsd?.message}
						{...register('priceUsd')}
					/>
					<Input
						label='Precio de compra (CUP)'
						type='number'
						step='0.01'
						min={0}
						hint='Opcional — alimenta el rendimiento por venta del inventario'
						error={errors.costCup?.message}
						{...register('costCup')}
					/>
				</div>
			) : (
				<>
					<div className='grid gap-4 sm:grid-cols-2'>
						<Input
							label='Precio de compra (CUP)'
							type='number'
							step='0.01'
							min={0}
							error={errors.costCup?.message}
							{...register('costCup')}
						/>
						<Input
							label='Margen (USD)'
							type='number'
							step='0.01'
							min={0}
							error={errors.marginUsd?.message}
							{...register('marginUsd')}
						/>
					</div>

					{rate ? (
						<p className='text-sm text-neutral-600'>
							Precio calculado: <span className='font-semibold'>{formatPrice(watch('priceUsd') || 0)}</span>{' '}
							(tasa vigente: {rate} CUP por USD)
						</p>
					) : (
						<p className='text-sm text-warning-600'>
							No hay una tasa de cambio vigente configurada — no se puede calcular el precio automático.
						</p>
					)}
				</>
			)}

			<div className='flex flex-col gap-3 border-t border-neutral-200 pt-4'>
				<Switch
					label='Aplicar descuento'
					checked={hasDiscount}
					onChange={checked => setValue('hasDiscount', checked, { shouldValidate: true })}
				/>

				{hasDiscount && (
					<Input
						label='Precio con descuento (USD)'
						type='number'
						step='0.01'
						min={0}
						hint={priceUsd ? `Precio original: ${formatPrice(priceUsd)}` : undefined}
						error={errors.discountPriceUsd?.message}
						{...register('discountPriceUsd')}
					/>
				)}
			</div>
		</div>
	);
};
