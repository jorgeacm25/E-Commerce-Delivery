import { cn } from '../../helpers';

interface Props {
	isClosing: boolean;
	onClick: () => void;
	/** Clase del color del velo (p. ej. `bg-secondary-950/40`). */
	colorClassName?: string;
}

// Fondo de modales y paneles laterales. El color y el blur van en capas
// separadas: si la misma capa con `backdrop-filter` anima su `opacity`, el
// navegador aplica el blur de golpe al empezar o terminar la animación y se
// ve un parpadeo. Aquí el color se desvanece y el blur crece de 0 a su valor.
export const ModalBackdrop = ({
	isClosing,
	onClick,
	colorClassName = 'bg-neutral-900/40',
}: Props) => (
	<div className='absolute inset-0' onClick={onClick} aria-hidden='true'>
		<div
			className={cn(
				'absolute inset-0',
				isClosing ? 'animate-backdrop-blur-out' : 'animate-backdrop-blur-in'
			)}
		/>
		<div
			className={cn(
				'absolute inset-0',
				colorClassName,
				isClosing ? 'animate-overlay-out' : 'animate-overlay-in'
			)}
		/>
	</div>
);
