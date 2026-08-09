import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Button, PageHeader } from '../../../components/ui';
import { ExchangeRateWidget } from '../../../components/admin/combos/ExchangeRateWidget';
import { AdminComboFormModal } from '../../../components/admin/combos/AdminComboFormModal';
import { CombosTable } from '../../../components/admin/combos/CombosTable';
import { useManageCombos } from '../../../hooks';
import { comboFormValuesToInput } from '../../../lib/adminComboValidators';

export const AdminCombosPage = () => {
	const { create, isCreating } = useManageCombos();
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Combos'
				description='Arma combos con productos del almacén.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={() => setModalOpen(true)}>
						Nuevo combo
					</Button>
				}
			/>

			<ExchangeRateWidget />

			<CombosTable />

			<AdminComboFormModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				isSubmitting={isCreating}
				onSubmit={values =>
					create(comboFormValuesToInput(values), { onSuccess: () => setModalOpen(false) })
				}
			/>
		</div>
	);
};
