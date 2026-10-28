import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '../../helpers';

interface Props {
	/** Sección que ocupa la pantalla al cargar y que hace el zoom de entrada. */
	hero: ReactNode;
	/** Sección que se abre desde el centro con el zoom inverso. */
	next: ReactNode;
	className?: string;
}

// Tramos del progreso del escenario (0 → 1), como en Espiral: primero el hero
// se acerca a la pantalla y, cuando ya casi ha "atravesado" la cámara, la
// siguiente sección se abre desde el centro. El último tramo es una pausa
// para que se lea antes de soltar el escenario.
const ZOOM_END = 0.55;
const REVEAL: [number, number] = [0.32, 0.72];

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

// Transición hero → sección siguiente ligada al scroll (ambas direcciones).
// El hero queda fijo (sticky) mientras un espaciador aporta el recorrido de
// scroll extra; JS escribe `--zoom` y `--reveal` (0 → 1) en el escenario sin
// re-renderizar React y las clases `.scroll-stage-*` de index.css los
// convierten en escala, desenfoque y apertura en iris (`clip-path`).
//
// Si el hero es más alto que la pantalla (móvil) se fija por su borde
// inferior (`top` negativo): primero se recorre entero y luego hace el zoom.
// Con movimiento reducido se renderizan las dos secciones una tras otra.
export const ScrollZoomStage = ({ hero, next, className }: Props) => {
	const [isEnabled] = useState(() => !prefersReducedMotion());
	const stageRef = useRef<HTMLDivElement | null>(null);
	const pinRef = useRef<HTMLDivElement | null>(null);
	const heroRef = useRef<HTMLDivElement | null>(null);
	const nextRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const stage = stageRef.current;
		const pin = pinRef.current;
		const heroLayer = heroRef.current;
		const nextLayer = nextRef.current;
		if (!isEnabled || !stage || !pin || !heroLayer || !nextLayer) return;

		let frameId = 0;
		let heroHeight = heroLayer.offsetHeight;

		const measure = () => {
			const viewportHeight = window.innerHeight;
			const pinTop = Math.min(0, viewportHeight - heroHeight);
			const travel = Math.max(stage.offsetHeight - heroHeight, 1);
			return { viewportHeight, pinTop, travel };
		};

		const update = () => {
			frameId = 0;
			const { viewportHeight, pinTop, travel } = measure();
			const progress = clamp((pinTop - stage.getBoundingClientRect().top) / travel);
			const reveal = clamp((progress - REVEAL[0]) / (REVEAL[1] - REVEAL[0]));

			pin.style.top = `${pinTop}px`;
			stage.style.setProperty('--zoom', clamp(progress / ZOOM_END).toFixed(4));
			stage.style.setProperty('--reveal', reveal.toFixed(4));
			// El zoom se centra en la parte del hero que se ve en pantalla
			stage.style.setProperty('--hero-origin', `${heroHeight - viewportHeight / 2}px`);
			stage.dataset.stage = reveal >= 0.5 ? 'next' : 'hero';
		};

		const requestUpdate = () => {
			if (!frameId) frameId = requestAnimationFrame(update);
		};

		// Teclado: si el foco entra en una capa que no está a la vista, se
		// desplaza el scroll hasta el punto en que esa capa se ve entera.
		const handleFocusIn = (event: FocusEvent) => {
			const target = event.target;
			if (!(target instanceof HTMLElement)) return;
			const { viewportHeight, pinTop, travel } = measure();
			const stageTop = stage.getBoundingClientRect().top + window.scrollY;
			const isNextVisible = stage.dataset.stage === 'next';

			if (heroLayer.contains(target) && isNextVisible) {
				const offsetInHero = target.getBoundingClientRect().top - heroLayer.getBoundingClientRect().top;
				const desiredTop = Math.min(0, Math.max(pinTop, viewportHeight / 3 - offsetInHero));
				window.scrollTo({ top: stageTop - desiredTop });
			} else if (nextLayer.contains(target) && !isNextVisible) {
				window.scrollTo({ top: stageTop - pinTop + REVEAL[1] * travel });
			}
		};

		const resizeObserver =
			typeof ResizeObserver === 'undefined'
				? null
				: new ResizeObserver(() => {
						heroHeight = heroLayer.offsetHeight;
						requestUpdate();
					});
		resizeObserver?.observe(heroLayer);

		update();
		window.addEventListener('scroll', requestUpdate, { passive: true });
		window.addEventListener('resize', requestUpdate);
		stage.addEventListener('focusin', handleFocusIn);

		return () => {
			cancelAnimationFrame(frameId);
			resizeObserver?.disconnect();
			window.removeEventListener('scroll', requestUpdate);
			window.removeEventListener('resize', requestUpdate);
			stage.removeEventListener('focusin', handleFocusIn);
		};
	}, [isEnabled]);

	// Sin escenario las dos secciones van directas al flujo del padre (que
	// pone su propio espaciado); `className` solo ajusta el escenario.
	if (!isEnabled) {
		return (
			<>
				{hero}
				{next}
			</>
		);
	}

	// `data-header-overlay`: la navbar sigue superpuesta (vidrio) mientras se vea
	// el hero y pasa a sólida con `data-stage='next'`; el hero escalado no
	// sirve de referencia (ver Header).
	return (
		<div ref={stageRef} data-header-overlay className={cn('scroll-stage relative', className)}>
			<div ref={pinRef} className='sticky top-0 min-h-[100svh] overflow-hidden'>
				<div ref={heroRef} className='scroll-stage-hero grid min-h-[100svh]'>
					{hero}
				</div>

				<div
					ref={nextRef}
					className='scroll-stage-next page-gradient absolute inset-x-0 bottom-0 flex h-[100svh] items-center overflow-hidden pb-6 pt-20'
				>
					<div className='scroll-stage-next-content w-full'>{next}</div>
				</div>
			</div>

			{/* Recorrido de scroll extra mientras el hero está fijo */}
			<div aria-hidden='true' className='h-[140svh]' />
		</div>
	);
};
