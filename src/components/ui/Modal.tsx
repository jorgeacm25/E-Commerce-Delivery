import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { cn } from '../../helpers';
import { IconButton } from './IconButton';
import { ModalBackdrop } from './ModalBackdrop';

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

// Duración de la animación de salida (ver `dialog-out`/`overlay-out` en tailwind.config.js)
const EXIT_DURATION_MS = 320;

interface ModalContent {
	title?: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

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

	// Guarda la última `onClose` sin que dispare el efecto de abajo: si
	// `onClose` dependiera directamente del efecto, cualquier modal con
	// estado controlado (re-renderiza en cada tecla, ej. RegisterProductOutModal)
	// recrearía `onClose` en cada tecla y el efecto volvería a enfocar el
	// panel, robándole el foco al input a mitad de escritura.
	const onCloseRef = useRef(onClose);
	useEffect(() => {
		onCloseRef.current = onClose;
	});

	useEffect(() => {
		if (!isOpen) return;

		document.body.style.overflow = 'hidden';

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onCloseRef.current();
		};

		document.addEventListener('keydown', handleKeyDown);
		panelRef.current?.focus();

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen]);

	// Al cerrar, el modal sigue montado mientras hace la animación de salida
	// y se desmonta al terminar.
	const [isMounted, setIsMounted] = useState(isOpen);
	if (isOpen && !isMounted) setIsMounted(true);
	const isClosing = isMounted && !isOpen;

	useEffect(() => {
		if (!isClosing) return;
		const timeoutId = window.setTimeout(() => setIsMounted(false), EXIT_DURATION_MS);
		return () => window.clearTimeout(timeoutId);
	}, [isClosing]);

	// Durante la salida se muestra el último contenido abierto: muchos padres
	// derivan título/contenido de un estado que se limpia al cerrar (p. ej.
	// `deletingId = null`), y sin esto el modal se vaciaría a mitad de la
	// animación o renderizaría hijos con datos nulos.
	const lastContentRef = useRef<ModalContent>({ title, description, children, footer });
	if (isOpen) lastContentRef.current = { title, description, children, footer };
	const content = isOpen ? { title, description, children, footer } : lastContentRef.current;

	if (!isMounted) return null;

	return createPortal(
		<div
			// Durante la salida ya no recibe clics
			className={cn(
				'fixed inset-0 z-50 flex items-center justify-center p-4',
				isClosing && 'pointer-events-none'
			)}
		>
			<ModalBackdrop isClosing={isClosing} onClick={onClose} />

			<div
				ref={panelRef}
				role='dialog'
				aria-modal='true'
				aria-labelledby={content.title ? 'modal-title' : undefined}
				aria-describedby={content.description ? 'modal-description' : undefined}
				tabIndex={-1}
				className={cn(
					'focus-ring relative flex w-full max-h-[90vh] flex-col rounded-2xl bg-white shadow-popover',
					sizeClasses[size],
					isClosing ? 'animate-dialog-out' : 'animate-dialog-in'
				)}
			>
				{content.title && (
					<div className='flex items-start justify-between gap-4 border-b border-neutral-200 p-5'>
						<div>
							<h2 id='modal-title' className='text-lg font-semibold text-neutral-900'>
								{content.title}
							</h2>
							{content.description && (
								<p id='modal-description' className='mt-1 text-sm text-neutral-500'>
									{content.description}
								</p>
							)}
						</div>

						<IconButton icon={<FiX />} label='Cerrar' onClick={onClose} />
					</div>
				)}

				<div className='overflow-y-auto p-5'>{content.children}</div>

				{content.footer && (
					<div className='flex justify-end gap-3 border-t border-neutral-200 p-5'>
						{content.footer}
					</div>
				)}
			</div>
		</div>,
		document.body
	);
};
