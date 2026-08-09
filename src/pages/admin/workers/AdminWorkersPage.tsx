import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Badge, Button, ConfirmDialog, DataTable, PageHeader, Switch } from '../../../components/ui';
import { WorkerFormModal } from '../../../components/admin/workers/WorkerFormModal';
import { useAdminWorkers, useManageWorkers } from '../../../hooks';
import { formatPrice } from '../../../helpers';

export const AdminWorkersPage = () => {
	const { workers, isLoading } = useAdminWorkers();
	const { create, isCreating, update, settle, isSettling } = useManageWorkers();

	const [modalOpen, setModalOpen] = useState(false);
	const [settlingId, setSettlingId] = useState<string | null>(null);

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader
				title='Trabajadores'
				description='Reparto y otros roles con pago pendiente.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={() => setModalOpen(true)}>
						Nuevo trabajador
					</Button>
				}
			/>

			<DataTable
				columns={[
					{ key: 'name', header: 'Nombre', render: worker => worker.fullName },
					{ key: 'role', header: 'Rol', render: worker => worker.role },
					{
						key: 'pending',
						header: 'Pago pendiente',
						render: worker =>
							worker.pendingAmountUsd > 0 ? (
								<Badge variant='warning'>{formatPrice(worker.pendingAmountUsd)}</Badge>
							) : (
								<span className='text-neutral-500'>$0.00</span>
							),
					},
					{
						key: 'active',
						header: 'Activo',
						render: worker => (
							<Switch
								checked={worker.active}
								onChange={checked => update({ id: worker.id, input: { active: checked } })}
							/>
						),
					},
					{
						key: 'actions',
						header: '',
						className: 'text-right',
						render: worker => (
							<div className='flex justify-end'>
								<Button
									size='sm'
									variant='outline'
									disabled={worker.pendingAmountUsd <= 0}
									onClick={() => setSettlingId(worker.id)}
								>
									Liquidar
								</Button>
							</div>
						),
					},
				]}
				data={workers}
				getRowId={worker => worker.id}
				isLoading={isLoading}
				emptyTitle='No hay trabajadores todavía'
				emptyDescription='Crea el primer trabajador para gestionar sus pagos.'
			/>

			<WorkerFormModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				isSubmitting={isCreating}
				onSubmit={values => create(values, { onSuccess: () => setModalOpen(false) })}
			/>

			<ConfirmDialog
				isOpen={Boolean(settlingId)}
				onClose={() => setSettlingId(null)}
				onConfirm={() => {
					if (settlingId) settle(settlingId);
					setSettlingId(null);
				}}
				title='¿Liquidar pago pendiente?'
				description='Marca el pago pendiente de este trabajador como saldado (vuelve a $0). Esta acción no se puede deshacer.'
				confirmLabel={isSettling ? 'Liquidando...' : 'Liquidar'}
				variant='danger'
			/>
		</div>
	);
};
