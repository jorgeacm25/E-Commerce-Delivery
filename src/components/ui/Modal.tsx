import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { cn } from '../../helpers';
import { IconButton } from './IconButton';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	size?: ModalSize;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-2xl',
};

export const Modal = ({
	isOpen,
	onClose,
	title,
	description,
	size = 'md',
	children,
	footer,
}: Props) => {
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		document.body.style.overflow = 'hidden';

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', handleKeyDown);
		panelRef.current?.focus();

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-neutral-900/50 animate-fade-in'
				onClick={onClose}
				aria-hidden='true'
			/>

			<div
				ref={panelRef}
				role='dialog'
				aria-modal='true'
				aria-labelledby={title ? 'modal-title' : undefined}
				aria-describedby={description ? 'modal-description' : undefined}
				tabIndex={-1}
				className={cn(
					'focus-ring relative flex w-full max-h-[90vh] flex-col rounded-2xl bg-white shadow-popover animate-scale-in',
					sizeClasses[size]
				)}
			>
				{title && (
					<div className='flex items-start justify-between gap-4 border-b border-neutral-200 p-5'>
						<div>
							<h2 id='modal-title' className='text-lg font-semibold text-neutral-900'>
								{title}
							</h2>
							{description && (
								<p id='modal-description' className='mt-1 text-sm text-neutral-500'>
									{description}
								</p>
							)}
						</div>

						<IconButton icon={<FiX />} label='Cerrar' onClick={onClose} />
					</div>
				)}

				<div className='overflow-y-auto p-5'>{children}</div>

				{footer && (
					<div className='flex justify-end gap-3 border-t border-neutral-200 p-5'>
						{footer}
					</div>
				)}
			</div>
		</div>,
		document.body
	);
};
