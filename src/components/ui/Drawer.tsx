import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { cn } from '../../helpers';
import { IconButton } from './IconButton';
import { PointerGlowCanvas } from './PointerGlowCanvas';

export type DrawerSide = 'left' | 'right';
export type DrawerSize = 'sm' | 'md';
/**
 * - `light`: panel blanco (por defecto).
 * - `brand`: panel en los verdes del hero, con el mismo shader de luz que
 *   sigue al puntero; el texto del panel pasa a blanco.
 */
export type DrawerTone = 'light' | 'brand';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	side?: DrawerSide;
	size?: DrawerSize;
	tone?: DrawerTone;
	/** Zona fija al pie del panel (no hace scroll con el contenido). */
	footer?: React.ReactNode;
	children: React.ReactNode;
}

// Duración de la animación de salida (ver `slide-out`/`fade-out` en tailwind.config.js)
const EXIT_DURATION_MS = 250;

const sizeClasses: Record<DrawerSize, string> = {
	sm: 'max-w-sm',
	md: 'max-w-md',
};

export const Drawer = ({
	isOpen,
	onClose,
	title,
	side = 'right',
	size = 'sm',
	tone = 'light',
	footer,
	children,
}: Props) => {
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

	// Al cerrar, el panel sigue montado mientras hace la animación de salida
	// y se desmonta al terminar.
	const [isMounted, setIsMounted] = useState(isOpen);
	if (isOpen && !isMounted) setIsMounted(true);
	const isClosing = isMounted && !isOpen;

	useEffect(() => {
		if (!isClosing) return;
		const timeoutId = window.setTimeout(() => setIsMounted(false), EXIT_DURATION_MS);
		return () => window.clearTimeout(timeoutId);
	}, [isClosing]);

	if (!isMounted) return null;

	const isBrand = tone === 'brand';
	const slideAnimation =
		side === 'right'
			? isClosing
				? 'animate-slide-out'
				: 'animate-slide-in'
			: isClosing
				? 'animate-slide-out-left'
				: 'animate-slide-in-left';

	return createPortal(
		<div
			// Durante la salida ya no recibe clics
			className={cn(
				'fixed inset-0 z-50 flex',
				side === 'right' && 'justify-end',
				isClosing && 'pointer-events-none'
			)}
		>
			<div
				className={cn(
					'absolute inset-0 bg-secondary-950/40 backdrop-blur-md',
					isClosing ? 'animate-fade-out' : 'animate-fade-in'
				)}
				onClick={onClose}
				aria-hidden='true'
			/>

			<div
				role='dialog'
				aria-modal='true'
				aria-labelledby={title ? 'drawer-title' : undefined}
				className={cn(
					'relative isolate flex h-full w-full flex-col overflow-hidden shadow-popover',
					sizeClasses[size],
					isBrand ? 'bg-secondary-800 text-white' : 'bg-white',
					slideAnimation
				)}
			>
				{isBrand && (
					// Mismo fondo que el hero (ver HeroBackdrop): degradado de respaldo
					// sin WebGL, shader encima y un velo oscuro para el contraste.
					<div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10'>
						<div className='absolute inset-0 bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800' />
						<PointerGlowCanvas scaleTo='viewport' className='absolute inset-0' />
						<div className='absolute inset-0 bg-secondary-950/35' />
					</div>
				)}

				{title && (
					<div
						className={cn(
							'flex items-center justify-between gap-4 border-b p-5',
							isBrand ? 'border-white/15' : 'border-neutral-200'
						)}
					>
						<h2
							id='drawer-title'
							className={cn('text-lg font-semibold', isBrand ? 'text-white' : 'text-neutral-900')}
						>
							{title}
						</h2>
						{isBrand ? (
							<button
								type='button'
								aria-label='Cerrar'
								title='Cerrar'
								onClick={onClose}
								className='focus-ring inline-flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-white/15'
							>
								<FiX aria-hidden='true' />
							</button>
						) : (
							<IconButton icon={<FiX />} label='Cerrar' onClick={onClose} />
						)}
					</div>
				)}

				<div className='flex-1 overflow-y-auto p-5'>{children}</div>

				{footer && (
					<div
						className={cn(
							'shrink-0 border-t p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
							isBrand
								? 'border-white/15 bg-secondary-950/40 backdrop-blur-md'
								: 'border-neutral-200 bg-neutral-50'
						)}
					>
						{footer}
					</div>
				)}
			</div>
		</div>,
		document.body
	);
};
