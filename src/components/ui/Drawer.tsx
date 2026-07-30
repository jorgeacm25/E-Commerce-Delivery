import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { cn } from '../../helpers';
import { IconButton } from './IconButton';

export type DrawerSide = 'left' | 'right';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	side?: DrawerSide;
	children: React.ReactNode;
}

export const Drawer = ({ isOpen, onClose, title, side = 'right', children }: Props) => {
	useEffect(() => {
		if (!isOpen) return;

		document.body.style.overflow = 'hidden';

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div className={cn('fixed inset-0 z-50 flex', side === 'right' && 'justify-end')}>
			<div
				className='absolute inset-0 bg-neutral-900/50 animate-fade-in'
				onClick={onClose}
				aria-hidden='true'
			/>

			<div
				role='dialog'
				aria-modal='true'
				aria-labelledby={title ? 'drawer-title' : undefined}
				className={cn(
					'relative flex h-full w-full max-w-sm flex-col bg-white shadow-popover',
					side === 'right' ? 'animate-slide-in' : 'animate-slide-in-left'
				)}
			>
				{title && (
					<div className='flex items-center justify-between gap-4 border-b border-neutral-200 p-5'>
						<h2 id='drawer-title' className='text-lg font-semibold text-neutral-900'>
							{title}
						</h2>
						<IconButton icon={<FiX />} label='Cerrar' onClick={onClose} />
					</div>
				)}

				<div className='flex-1 overflow-y-auto p-5'>{children}</div>
			</div>
		</div>,
		document.body
	);
};
