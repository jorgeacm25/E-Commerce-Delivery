import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '../../helpers';

interface Props {
	children: ReactNode;
	className?: string;
	/** Retraso en ms antes de animar — sirve para escalonar secciones hermanas. */
	delay?: number;
}

type RevealState = 'hidden' | 'from-below' | 'from-above';

// Aparece suavemente cada vez que el elemento entra en el viewport, tanto
// bajando (sube desde abajo) como subiendo (baja desde arriba). Se vuelve a
// ocultar cuando sale del todo, para repetir la animación en la próxima
// entrada. Sin IntersectionObserver (tests/jsdom) se muestra directamente
// para no dejar contenido oculto.
export const Reveal = ({ children, className = '', delay = 0 }: Props) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<RevealState>('hidden');

	useEffect(() => {
		if (typeof IntersectionObserver === 'undefined') {
			setState('from-below');
			return;
		}

		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (entry.intersectionRatio >= 0.15) {
						// Si su borde superior está por encima del viewport, se está
						// entrando al hacer scroll hacia arriba.
						const enteringFromAbove = entry.boundingClientRect.top < 0;
						setState(current =>
							current === 'hidden' ? (enteringFromAbove ? 'from-above' : 'from-below') : current
						);
					} else if (!entry.isIntersecting) {
						setState('hidden');
					}
				}
			},
			{ threshold: [0, 0.15] }
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn(
				state === 'hidden' && 'opacity-0',
				state === 'from-below' && 'animate-reveal',
				state === 'from-above' && 'animate-reveal-down',
				className
			)}
			style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
		>
			{children}
		</div>
	);
};
