import { useState } from 'react';
import { FiDollarSign, FiPlus, FiTrendingDown, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Badge, BadgeVariant, Button, DataTable, PageHeader, Select, StatCard } from '../../../components/ui';
import { ExpenseFormModal } from '../../../components/admin/accounting/ExpenseFormModal';
import { useLedgerEntries, useCreateExpense } from '../../../hooks';
import { LedgerEntryType } from '../../../interfaces';
import { formatDateLong, formatPrice } from '../../../helpers';

const typeLabels: Record<LedgerEntryType, string> = {
	venta: 'Venta',
	comision: 'Comisión',
	remesa: 'Remesa',
	gasto: 'Gasto',
};

const typeVariant: Record<LedgerEntryType, BadgeVariant> = {
	venta: 'success',
	comision: 'warning',
	remesa: 'primary',
	gasto: 'danger',
};

const typeOptions = [
	{ value: 'venta', label: 'Ventas' },
	{ value: 'comision', label: 'Comisiones liquidadas' },
	{ value: 'remesa', label: 'Remesas' },
	{ value: 'gasto', label: 'Gastos' },
];

export const AdminAccountingPage = () => {
	const { entries, summary, isLoading } = useLedgerEntries();
	const { create, isCreating } = useCreateExpense();

	const [typeFilter, setTypeFilter] = useState('');
	const [modalOpen, setModalOpen] = useState(false);

	const filtered = typeFilter ? entries.filter(entry => entry.type === typeFilter) : entries;

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Contabilidad'
				description='Libro contable: ventas, comisiones liquidadas, remesas y gastos.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={() => setModalOpen(true)}>
						Registrar gasto
					</Button>
				}
			/>

			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
				<StatCard label='Ventas' value={formatPrice(summary.salesUsd)} icon={<FiTrendingUp />} isLoading={isLoading} />
				<StatCard
					label='Comisiones liquidadas'
					value={formatPrice(summary.settledCommissionsUsd)}
					icon={<FiUsers />}
					isLoading={isLoading}
				/>
				<StatCard label='Remesas' value={formatPrice(summary.remittancesUsd)} icon={<FiDollarSign />} isLoading={isLoading} />
				<StatCard label='Gastos' value={formatPrice(summary.expensesUsd)} icon={<FiTrendingDown />} isLoading={isLoading} />
				<StatCard
					label='Balance neto'
					value={formatPrice(summary.balanceUsd)}
					trend={summary.balanceUsd >= 0 ? 'up' : 'down'}
					isLoading={isLoading}
				/>
			</div>

			<Select
				placeholder='Todos los movimientos'
				value={typeFilter}
				onChange={event => setTypeFilter(event.target.value)}
				options={typeOptions}
				containerClassName='sm:max-w-xs'
			/>

			<DataTable
				columns={[
					{
						key: 'type',
						header: 'Tipo',
						render: entry => <Badge variant={typeVariant[entry.type]}>{typeLabels[entry.type]}</Badge>,
					},
					{ key: 'description', header: 'Detalle', render: entry => entry.description },
					{
						key: 'amount',
						header: 'Monto',
						render: entry => (
							<span className={entry.amountUsd < 0 ? 'text-danger-600' : 'text-success-600'}>
								{entry.amountUsd < 0 ? '-' : '+'}
								{formatPrice(Math.abs(entry.amountUsd))}
							</span>
						),
					},
					{ key: 'date', header: 'Fecha', render: entry => formatDateLong(entry.date) },
				]}
				data={filtered}
				getRowId={entry => entry.id}
				isLoading={isLoading}
				emptyTitle='Sin movimientos'
				emptyDescription='Todavía no hay movimientos contables con este filtro.'
			/>

			<ExpenseFormModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				isSubmitting={isCreating}
				onSubmit={values => create(values, { onSuccess: () => setModalOpen(false) })}
			/>
		</div>
	);
};
