import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Badge, Button, ConfirmDialog, DataTable, PageHeader, Switch } from '../../../components/ui';
import { SellerFormModal } from '../../../components/admin/sellers/SellerFormModal';
import { useAdminSellers, useManageSellers } from '../../../hooks';
import { formatPrice } from '../../../helpers';

export const AdminSellersPage = () => {
	const { sellers, isLoading } = useAdminSellers();
	const { create, isCreating, update, settle, isSettling } = useManageSellers();

	const [modalOpen, setModalOpen] = useState(false);
	const [settlingId, setSettlingId] = useState<string | null>(null);

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader
				title='Vendedores'
				description='Comisiones generadas automáticamente al entregar pedidos con vendedor asignado.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={() => setModalOpen(true)}>
						Nuevo vendedor
					</Button>
				}
			/>

			<DataTable
				columns={[
					{ key: 'name', header: 'Nombre', render: seller => seller.fullName },
					{ key: 'phone', header: 'Teléfono', render: seller => seller.phone || '—' },
					{
						key: 'commission',
						header: 'Comisión',
						render: seller => `${seller.commissionPercentage}%`,
					},
					{
						key: 'pending',
						header: 'Comisión pendiente',
						render: seller =>
							seller.pendingCommissionUsd > 0 ? (
								<Badge variant='warning'>{formatPrice(seller.pendingCommissionUsd)}</Badge>
							) : (
								<span className='text-neutral-500'>$0.00</span>
							),
					},
					{
						key: 'active',
						header: 'Activo',
						render: seller => (
							<Switch
								checked={seller.active}
								onChange={checked => update({ id: seller.id, input: { active: checked } })}
							/>
						),
					},
					{
						key: 'actions',
						header: '',
						className: 'text-right',
						render: seller => (
							<div className='flex justify-end'>
								<Button
									size='sm'
									variant='outline'
									disabled={seller.pendingCommissionUsd <= 0}
									onClick={() => setSettlingId(seller.id)}
								>
									Liquidar
								</Button>
							</div>
						),
					},
				]}
				data={sellers}
				getRowId={seller => seller.id}
				isLoading={isLoading}
				emptyTitle='No hay vendedores todavía'
				emptyDescription='Crea el primer vendedor para poder asignarle pedidos.'
			/>

			<SellerFormModal
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
				title='¿Liquidar comisiones pendientes?'
				description='Marca todas las comisiones pendientes de este vendedor como pagadas. Esta acción no se puede deshacer.'
				confirmLabel={isSettling ? 'Liquidando...' : 'Liquidar'}
				variant='danger'
			/>
		</div>
	);
};
