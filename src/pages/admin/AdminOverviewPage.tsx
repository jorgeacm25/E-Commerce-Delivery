import { FiCreditCard, FiPackage, FiShoppingBag, FiUsers } from 'react-icons/fi';
import { PageHeader, StatCard } from '../../components/ui';

export const AdminOverviewPage = () => {
	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Resumen'
				description='Panel administrativo en construcción. Los datos mostrados son de ejemplo.'
			/>

			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard label='Pedidos hoy' value='0' icon={<FiShoppingBag />} />
				<StatCard label='Ventas del mes' value='$0.00' icon={<FiCreditCard />} />
				<StatCard label='Productos' value='0' icon={<FiPackage />} />
				<StatCard label='Clientes' value='0' icon={<FiUsers />} />
			</div>
		</div>
	);
};
