import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

const SLAT_COUNT = 7;
const COVER_MS = 380;
const REVEAL_MS = 420;
const STAGGER_MS = 45;
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';

// Sección del panel = primer segmento después de /admin ('' es el Dashboard).
// Las subrutas (p. ej. /admin/pedidos/:id) y los cambios de query no
// cuentan como cambio de sección y no disparan la transición.
const sectionOf = (pathname: string) => pathname.split('/')[2] ?? '';

const prefersReducedMotion = () =>
	typeof window.matchMedia === 'function' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

// Transición "curtains: blinds" (referencia: motion.dev/examples) entre
// secciones del panel admin: unas persianas horizontales en el verde de la
// marca se cierran de arriba abajo sobre el contenido, se cambia la página
// y vuelven a abrirse. La página anterior se mantiene montada (congelada)
// mientras las persianas se cierran.
export const AdminRouteTransition = () => {
	const location = useLocation();
	const outlet = useOutlet();
	const section = sectionOf(location.pathname);

	const [displayedSection, setDisplayedSection] = useState(section);
	const displayedSectionRef = useRef(section);
	const frozenOutletRef = useRef<ReactNode>(outlet);
	const containerRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const slatRefs = useRef<(HTMLDivElement | null)[]>([]);

	const isTransitioning = section !== displayedSection;
	// Mientras no hay transición se guarda la página actual; al cambiar de
	// sección se sigue mostrando esa copia hasta que las persianas cubren.
	if (!isTransitioning) frozenOutletRef.current = outlet;

	useEffect(() => {
		if (section === displayedSectionRef.current) return;

		const showSection = () => {
			displayedSectionRef.current = section;
			setDisplayedSection(section);
		};

		const overlay = overlayRef.current;
		const container = containerRef.current;
		const slats = slatRefs.current.filter((slat): slat is HTMLDivElement => slat !== null);

		if (!overlay || !container || slats.length === 0 || prefersReducedMotion()) {
			showSection();
			return;
		}

		let cancelled = false;

		// Las persianas cubren la parte visible del panel de contenido (el
		// <main> que lo envuelve, con su padding y su esquina redondeada)
		const panel = container.closest('main') ?? container;
		const placeOverlay = () => {
			const rect = panel.getBoundingClientRect();
			const top = Math.max(rect.top, 0);
			const bottom = Math.min(rect.bottom, window.innerHeight);
			Object.assign(overlay.style, {
				top: `${top}px`,
				left: `${rect.left}px`,
				width: `${rect.width}px`,
				height: `${Math.max(bottom - top, 0)}px`,
				display: 'flex',
				borderTopLeftRadius: rect.top >= 0 ? getComputedStyle(panel).borderTopLeftRadius : '0px',
				borderTopRightRadius: rect.top >= 0 ? getComputedStyle(panel).borderTopRightRadius : '0px',
			});
		};

		const animateSlats = (from: number, to: number, origin: 'top' | 'bottom', duration: number) =>
			Promise.all(
				slats.map((slat, index) => {
					slat.style.transformOrigin = origin;
					return slat
						.animate([{ transform: `scaleY(${from})` }, { transform: `scaleY(${to})` }], {
							duration,
							delay: index * STAGGER_MS,
							easing: EASING,
							fill: 'forwards',
						})
						.finished.catch(() => undefined);
				})
			);

		const run = async () => {
			slats.forEach(slat => slat.getAnimations().forEach(animation => animation.cancel()));
			placeOverlay();

			await animateSlats(0, 1, 'top', COVER_MS);
			if (cancelled) return;

			showSection();
			window.scrollTo({ top: 0 });
			await nextFrame();
			if (cancelled) return;
			placeOverlay();

			await animateSlats(1, 0, 'bottom', REVEAL_MS);
			if (cancelled) return;

			overlay.style.display = 'none';
			slats.forEach(slat => slat.getAnimations().forEach(animation => animation.cancel()));
		};

		void run();

		return () => {
			cancelled = true;
		};
		// Solo depende de la sección pedida: el cambio de `displayedSection` a
		// mitad de la animación no debe cancelar la apertura de las persianas.
	}, [section]);

	return (
		<div ref={containerRef} className='h-full'>
			{isTransitioning ? frozenOutletRef.current : outlet}

			<div
				ref={overlayRef}
				aria-hidden='true'
				className='pointer-events-none fixed z-30 hidden flex-col overflow-hidden'
			>
				{Array.from({ length: SLAT_COUNT }).map((_, index) => (
					<div
						key={index}
						ref={element => {
							slatRefs.current[index] = element;
						}}
						className={
							index % 2 === 0
								? '-mb-px flex-1 scale-y-0 bg-secondary-700'
								: '-mb-px flex-1 scale-y-0 bg-secondary-600'
						}
					/>
				))}
			</div>
		</div>
	);
};
