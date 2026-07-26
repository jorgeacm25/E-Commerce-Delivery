import { useActiveExchangeRate } from '../../hooks';
import { convertUsdToCup, formatCup, formatPrice } from '../../helpers';

interface Props {
	usd: number;
	className?: string;
	cupClassName?: string;
}

// Se puede colocar en cualquier lugar donde hoy se use formatPrice(usd) a secas.
// Muestra el precio en USD como referencia principal, y el equivalente en CUP
// debajo, calculado con la tasa de cambio vigente (o nada si aún no hay tasa cargada).
export const DualPrice = ({ usd, className, cupClassName }: Props) => {
	const { data: rate } = useActiveExchangeRate();

	return (
		<span className='inline-flex flex-col'>
			<span className={className}>{formatPrice(usd)}</span>
			{rate && (
				<span className={cupClassName ?? 'text-xs text-gray-500'}>
					≈ {formatCup(convertUsdToCup(usd, rate.valor_cup_por_usd))}
				</span>
			)}
		</span>
	);
};
