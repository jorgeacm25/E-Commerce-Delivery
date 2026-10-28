import { cn } from '../../helpers';

interface Props {
	text: string;
	// Retardo entre una letra y la siguiente, en milisegundos
	staggerMs?: number;
	className?: string;
}

// Texto "rodante" escalonado: al hacer hover (o foco con teclado) sobre el
// ancestro con la clase `group`, cada letra sube y la reemplaza una copia
// que entra desde abajo, una detrás de otra. El texto real queda en un
// `sr-only` para que los lectores de pantalla lean la frase completa y no
// letra por letra. Con "reducir movimiento" no hay animación.
export const RollingText = ({ text, staggerMs = 18, className }: Props) => {
	return (
		<span className={cn('relative inline-flex overflow-hidden leading-tight', className)}>
			<span className='sr-only'>{text}</span>
			<span aria-hidden='true' className='flex'>
				{Array.from(text).map((char, index) => (
					<span
						key={index}
						style={{ transitionDelay: `${index * staggerMs}ms` }}
						className='relative inline-block whitespace-pre transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-visible:translate-y-0'
					>
						{char}
						<span className='absolute left-0 top-full'>{char}</span>
					</span>
				))}
			</span>
		</span>
	);
};
