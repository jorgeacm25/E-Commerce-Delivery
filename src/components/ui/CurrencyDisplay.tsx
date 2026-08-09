import { formatPrice, cn } from '../../helpers';

interface Props {
	usd: number;
	// Si se pasa y es menor que `usd`, se muestra `usd` tachado al lado del
	// precio rebajado en vez del precio único normal.
	discountedUsd?: number;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const sizeClasses = {
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-xl',
};

const strikethroughSizeClasses = {
	sm: 'text-xs',
	md: 'text-sm',
	lg: 'text-base',
};

// La tienda pública muestra el precio solo en USD (decisión de negocio).
// La tasa de cambio USD→CUP sigue existiendo internamente en Supabase
// (exchange_rates, useActiveExchangeRate) para uso del panel admin.
export const CurrencyDisplay = ({ usd, discountedUsd, size = 'md', className }: Props) => {
	const hasDiscount = discountedUsd !== undefined && discountedUsd < usd;

	if (hasDiscount) {
		return (
			<span className={cn('flex flex-wrap items-baseline gap-2', className)}>
				<span className={cn('font-semibold text-primary-700', sizeClasses[size])}>
					{formatPrice(discountedUsd)}
				</span>
				<span className={cn('text-neutral-400 line-through', strikethroughSizeClasses[size])}>
					{formatPrice(usd)}
				</span>
			</span>
		);
	}

	return (
		<span className={cn('font-semibold text-neutral-900', sizeClasses[size], className)}>
			{formatPrice(usd)}
		</span>
	);
};
