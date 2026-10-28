// Efecto "add to basket" (referencia: motion.dev/examples/react-add-to-basket)
// hecho con la Web Animations API, sin dependencias:
// 1. Una copia de la imagen del producto vuela en arco hasta el carrito del
//    header, encogiéndose al tamaño del icono y desvaneciéndose al final.
// 2. El carrito recibe el "golpe": se desplaza en la dirección del impacto
//    y vuelve a su sitio con una oscilación amortiguada (aprox. de resorte).
// 3. Un anillo sale del carrito como una onda.
// El destino es el elemento marcado con `data-cart-target` (ver CartLink).
// Con "reducir movimiento" no se anima nada y la promesa resuelve al instante.

const FLY_DURATION_MS = 450;
const IMPACT_DURATION_MS = 500;
const ARC_SAMPLES = 24;
// Curva de motion.dev: acelera al entrar en el carrito
const FLY_EASING = 'cubic-bezier(0.74, 0.18, 0.93, 0.69)';

const prefersReducedMotion = () =>
	typeof window.matchMedia === 'function' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isInViewport = (rect: DOMRect) =>
	rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;

const findCartTarget = () =>
	Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]')).find(element =>
		isInViewport(element.getBoundingClientRect())
	);

const buildFlyer = (source: HTMLElement, from: DOMRect) => {
	const flyer = document.createElement('div');
	Object.assign(flyer.style, {
		position: 'fixed',
		left: `${from.left}px`,
		top: `${from.top}px`,
		width: `${from.width}px`,
		height: `${from.height}px`,
		zIndex: '60',
		pointerEvents: 'none',
		borderRadius: '1rem',
		background: '#fff',
		boxShadow: '0 10px 30px -5px rgb(51 51 56 / 0.25)',
		overflow: 'hidden',
		willChange: 'transform, opacity',
	});
	flyer.setAttribute('aria-hidden', 'true');

	const image = source instanceof HTMLImageElement ? source : source.querySelector('img');
	if (image) {
		const copy = document.createElement('img');
		copy.src = image.currentSrc || image.src;
		copy.alt = '';
		Object.assign(copy.style, { width: '100%', height: '100%', objectFit: 'contain', padding: '8%' });
		flyer.appendChild(copy);
	}

	document.body.appendChild(flyer);
	return flyer;
};

// Puntos de una bézier cuadrática desde (0,0) hasta (dx,dy). El punto de
// control sube primero y luego cae sobre el carrito, como un lanzamiento.
const arcPoint = (t: number, dx: number, dy: number) => {
	const controlX = dx * 0.15;
	const controlY = Math.min(dy, 0) - Math.max(80, Math.abs(dx) * 0.25);
	const inverse = 1 - t;
	return {
		x: 2 * inverse * t * controlX + t * t * dx,
		y: 2 * inverse * t * controlY + t * t * dy,
	};
};

const playImpact = (target: HTMLElement, directionX: number, directionY: number) => {
	const length = Math.hypot(directionX, directionY) || 1;
	const kickX = (directionX / length) * 8;
	const kickY = (directionY / length) * 8;
	const offsets = [0, 0.15, 0.35, 0.55, 0.75, 1];
	const amplitudes = [0, 1, -0.5, 0.25, -0.1, 0];

	target.animate(
		offsets.map((offset, index) => ({
			offset,
			transform: `translate(${kickX * amplitudes[index]}px, ${kickY * amplitudes[index]}px)`,
		})),
		{ duration: IMPACT_DURATION_MS, easing: 'ease-out' }
	);

	const ring = document.createElement('span');
	ring.setAttribute('aria-hidden', 'true');
	Object.assign(ring.style, {
		position: 'absolute',
		inset: '0',
		borderRadius: '9999px',
		border: '2px solid #FF6F26',
		pointerEvents: 'none',
	});
	target.appendChild(ring);
	ring
		.animate(
			[
				{ transform: 'scale(1)', opacity: 0.8 },
				{ transform: 'scale(2.2)', opacity: 0 },
			],
			{ duration: IMPACT_DURATION_MS, easing: 'ease-out' }
		)
		.finished.finally(() => ring.remove());
};

export const flyToCart = async (source: HTMLElement | null): Promise<void> => {
	if (!source || typeof document === 'undefined' || prefersReducedMotion()) return;
	if (typeof source.animate !== 'function') return;

	const target = findCartTarget();
	const from = source.getBoundingClientRect();
	if (!target || !isInViewport(from)) return;

	const to = target.getBoundingClientRect();
	const dx = to.left + to.width / 2 - (from.left + from.width / 2);
	const dy = to.top + to.height / 2 - (from.top + from.height / 2);
	const endScale = Math.max(to.width / Math.max(from.width, from.height), 0.1);

	const flyer = buildFlyer(source, from);

	const keyframes: Keyframe[] = Array.from({ length: ARC_SAMPLES + 1 }, (_, index) => {
		const t = index / ARC_SAMPLES;
		const { x, y } = arcPoint(t, dx, dy);
		const scale = 1 + (endScale - 1) * t;
		return {
			offset: t,
			transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${t * 12}deg)`,
			// Se mantiene visible y se apaga en el último 5% del vuelo
			opacity: t < 0.95 ? 1 : 1 - (t - 0.95) / 0.05,
		};
	});

	try {
		await flyer.animate(keyframes, { duration: FLY_DURATION_MS, easing: FLY_EASING, fill: 'forwards' })
			.finished;
	} catch {
		// Animación cancelada (p. ej. navegación): no hay nada que recuperar
	} finally {
		flyer.remove();
	}

	const last = arcPoint(1, dx, dy);
	const beforeLast = arcPoint(1 - 1 / ARC_SAMPLES, dx, dy);
	playImpact(target, last.x - beforeLast.x, last.y - beforeLast.y);
};
