import { ExchangeRateWidget } from '../../components/dashboard/combos/ExchangeRateWidget';
import { FormCombo } from '../../components/dashboard/combos/FormCombo';
import { TableCombos } from '../../components/dashboard/combos/TableCombos';
import { Loader } from '../../components/shared/Loader';
import { useAllCombosAdmin } from '../../hooks';

export const DashboardCombosPage = () => {
	const { data, isLoading } = useAllCombosAdmin();

	return (
		<div className='space-y-8'>
			<h1 className='text-2xl font-bold'>Combos y tasa de cambio</h1>

			<ExchangeRateWidget />

			<FormCombo />

			<div className='space-y-3'>
				<h2 className='font-semibold text-lg'>Combos existentes</h2>
				{isLoading || !data ? (
					<Loader />
				) : (
					<TableCombos combos={data} />
				)}
			</div>
		</div>
	);
};
