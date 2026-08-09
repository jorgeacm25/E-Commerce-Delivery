import { Select } from '../ui';
import { AdminDateRangePreset } from '../../interfaces';
import { useAdminUiStore } from '../../store/adminUi.store';

const options: { value: AdminDateRangePreset; label: string }[] = [
	{ value: 'today', label: 'Hoy' },
	{ value: 'week', label: 'Esta semana' },
	{ value: 'month', label: 'Este mes' },
];

// Solo afecta las stats reales del Dashboard (pedidos hoy/ventas del mes),
// no un filtro global sobre Pedidos/Productos — decisión explícita, ver
// plan de la Fase B admin.
export const AdminDateRangeSelector = () => {
	const dashboardDateRange = useAdminUiStore(state => state.dashboardDateRange);
	const setDashboardDateRange = useAdminUiStore(state => state.setDashboardDateRange);

	return (
		<Select
			aria-label='Rango de fechas del dashboard'
			options={options}
			value={dashboardDateRange}
			onChange={event => setDashboardDateRange(event.target.value as AdminDateRangePreset)}
			containerClassName='w-40'
		/>
	);
};
