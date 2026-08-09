import { useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { ConfirmDialog, CurrencyDisplay, DataTable, IconButton } from '../../ui';
import { useAdminCombos, useManageCombos } from '../../../hooks';
import { AdminComboFormModal } from './AdminComboFormModal';
import { AdminCombo } from '../../../interfaces';
import { comboFormValuesToInput } from '../../../lib/adminComboValidators';

export const CombosTable = () => {
	const { combos, isLoading } = useAdminCombos();
	const { update, isUpdating, remove } = useManageCombos();
	const [editingCombo, setEditingCombo] = useState<AdminCombo | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	return (
		<>
			<DataTable
				columns={[
					{ key: 'name', header: 'Combo', render: combo => combo.name },
					{ key: 'products', header: 'Productos', render: combo => combo.products.length },
					{
						key: 'price',
						header: 'Precio',
						render: combo => (
							<CurrencyDisplay
								usd={combo.priceUsd}
								discountedUsd={combo.discountPriceUsd ?? undefined}
								size='sm'
							/>
						),
					},
					{
						key: 'actions',
						header: '',
						className: 'text-right',
						render: combo => (
							<div className='flex justify-end gap-1'>
								<IconButton
									icon={<FiEdit2 />}
									label='Editar combo'
									onClick={() => setEditingCombo(combo)}
								/>
								<IconButton
									icon={<FiTrash2 />}
									label='Eliminar combo'
									onClick={() => setDeletingId(combo.id)}
								/>
							</div>
						),
					},
				]}
				data={combos}
				getRowId={combo => combo.id}
				isLoading={isLoading}
				emptyTitle='No hay combos todavía'
				emptyDescription='Crea el primer combo con productos del almacén.'
			/>

			<AdminComboFormModal
				isOpen={editingCombo !== null}
				onClose={() => setEditingCombo(null)}
				isSubmitting={isUpdating}
				combo={editingCombo}
				onSubmit={values => {
					if (!editingCombo) return;
					update(
						{ id: editingCombo.id, input: comboFormValuesToInput(values) },
						{ onSuccess: () => setEditingCombo(null) }
					);
				}}
			/>

			<ConfirmDialog
				isOpen={Boolean(deletingId)}
				onClose={() => setDeletingId(null)}
				onConfirm={() => {
					if (deletingId) remove(deletingId);
					setDeletingId(null);
				}}
				title='¿Eliminar este combo?'
				description='Esta acción no se puede deshacer.'
				confirmLabel='Eliminar'
				variant='danger'
			/>
		</>
	);
};
