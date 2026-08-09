import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { IconButton, Input } from '../../ui';
import { useManageDeliveryZones } from '../../../hooks';

interface Props {
	municipalityId: string;
	deliveryFeeUsd: number;
}

export const MunicipalityFeeCell = ({ municipalityId, deliveryFeeUsd }: Props) => {
	const { updateFee, isUpdatingFee } = useManageDeliveryZones();
	const [draft, setDraft] = useState(String(deliveryFeeUsd));

	const parsed = Number(draft);
	const isValid = draft.trim() !== '' && !Number.isNaN(parsed) && parsed >= 0;
	const hasChanges = isValid && parsed !== deliveryFeeUsd;

	const handleSave = () => {
		if (!hasChanges) return;
		updateFee({ id: municipalityId, deliveryFeeUsd: parsed });
	};

	return (
		<div className='flex items-center gap-2'>
			<Input
				type='number'
				min={0}
				step='0.01'
				value={draft}
				onChange={event => setDraft(event.target.value)}
				className='w-24'
				aria-label='Tarifa de domicilio en USD'
			/>
			<IconButton
				icon={<FiCheck />}
				label='Guardar tarifa'
				variant={hasChanges ? 'primary' : 'outline'}
				disabled={!hasChanges}
				isLoading={isUpdatingFee}
				onClick={handleSave}
			/>
		</div>
	);
};
