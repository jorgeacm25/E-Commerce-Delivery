import { formatPrice, cn } from '../../helpers';

interface Props {
	usd: number;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const sizeClasses = {
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-xl',
};

// La tienda pública muestra el precio solo en USD (decisión de negocio).
// La tasa de cambio USD→CUP sigue existiendo internamente en Supabase
// (exchange_rates, useActiveExchangeRate) para uso del panel admin.
export const CurrencyDisplay = ({ usd, size = 'md', className }: Props) => (
	<span className={cn('font-semibold text-neutral-900', sizeClasses[size], className)}>
		{formatPrice(usd)}
	</span>
);
