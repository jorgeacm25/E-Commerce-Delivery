import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Badge, BadgeVariant, Button, DataTable, PageHeader, Select } from '../../../components/ui';
import { RemittanceFormModal } from '../../../components/admin/remittances/RemittanceFormModal';
import { useAdminRemittances, useManageRemittances } from '../../../hooks';
import { AdminRemittanceStatus } from '../../../interfaces';
import { formatDateLong, formatPrice, formatCup } from '../../../helpers';

const statusOptions: { value: AdminRemittanceStatus; label: string }[] = [
	{ value: 'Pending', label: 'Pendiente' },
	{ value: 'Sent', label: 'Enviada' },
	{ value: 'Delivered', label: 'Entregada' },
];

const statusVariant: Record<string, BadgeVariant> = {
	Pending: 'warning',
	Sent: 'primary',
	Delivered: 'success',
};

export const AdminRemittancesPage = () => {
	const { remittances, isLoading } = useAdminRemittances();
	const { create, isCreating, updateStatus } = useManageRemittances();

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader
				title='Remesas'
				description='Gestión de envíos de remesas en CUP/USD.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={() => setModalOpen(true)}>
						Nueva remesa
					</Button>
				}
			/>

			<DataTable
				columns={[
					{ key: 'recipient', header: 'Destinatario', render: remittance => remittance.recipientName },
					{
						key: 'amount',
						header: 'Monto',
						render: remittance => (
							<div>
								<p>{formatPrice(remittance.amountUsd)}</p>
								{remittance.amountCup > 0 && (
									<p className='text-xs text-neutral-500'>{formatCup(remittance.amountCup)}</p>
								)}
							</div>
						),
					},
					{
						key: 'status',
						header: 'Estado',
						render: remittance => (
							<div className='flex items-center gap-2'>
								<Badge variant={statusVariant[remittance.status] ?? 'neutral'}>
									{statusOptions.find(o => o.value === remittance.status)?.label ?? remittance.status}
								</Badge>
								<Select
									aria-label='Cambiar estado de la remesa'
									value={remittance.status}
									onChange={event =>
										updateStatus({ id: remittance.id, status: event.target.value })
									}
									options={statusOptions}
									containerClassName='w-36'
								/>
							</div>
						),
					},
					{
						key: 'date',
						header: 'Fecha',
						render: remittance => formatDateLong(remittance.createdAt),
					},
				]}
				data={remittances}
				getRowId={remittance => remittance.id}
				isLoading={isLoading}
				emptyTitle='No hay remesas todavía'
				emptyDescription='Registra la primera remesa para empezar a darle seguimiento.'
			/>

			<RemittanceFormModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				isSubmitting={isCreating}
				onSubmit={values => create(values, { onSuccess: () => setModalOpen(false) })}
			/>
		</div>
	);
};
