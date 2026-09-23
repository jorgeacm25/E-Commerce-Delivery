import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '../../helpers';

interface Props {
	children: ReactNode;
	className?: string;
	/** Retraso en ms antes de animar — sirve para escalonar secciones hermanas. */
	delay?: number;
}

// Aparece suavemente cuando el elemento entra en el viewport
// (IntersectionObserver, un solo disparo por elemento).
// Sin IntersectionObserver (tests/jsdom) se muestra directamente para no
// dejar contenido oculto.
export const Reveal = ({ children, className = '', delay = 0 }: Props) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (typeof IntersectionObserver === 'undefined') {
			setVisible(true);
			return;
		}

		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setVisible(true);
						observer.disconnect();
					}
				}
			},
			{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn(visible ? 'animate-reveal' : 'opacity-0', className)}
			style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
		>
			{children}
		</div>
	);
};
