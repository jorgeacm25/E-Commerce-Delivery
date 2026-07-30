import { useState } from 'react';
import { Modal } from './Modal';
import { Button, ButtonVariant } from './Button';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: Extract<ButtonVariant, 'primary' | 'danger'>;
}

export const ConfirmDialog = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel = 'Confirmar',
	cancelLabel = 'Cancelar',
	variant = 'primary',
}: Props) => {
	const [isConfirming, setIsConfirming] = useState(false);

	const handleConfirm = async () => {
		setIsConfirming(true);
		try {
			await onConfirm();
		} finally {
			setIsConfirming(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={title}
			description={description}
			size='sm'
			footer={
				<>
					<Button variant='outline' onClick={onClose} disabled={isConfirming}>
						{cancelLabel}
					</Button>
					<Button variant={variant} onClick={handleConfirm} isLoading={isConfirming}>
						{confirmLabel}
					</Button>
				</>
			}
		>
			{null}
		</Modal>
	);
};
