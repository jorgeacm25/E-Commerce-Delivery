import { useEffect, useRef } from 'react';
import { cn } from '../../helpers';

interface Props {
	className?: string;
}

interface Particle {
	x: number;
	y: number;
	radius: number;
	velocityX: number;
	velocityY: number;
	alpha: number;
	phase: number;
}

const MAX_PIXEL_RATIO = 1.5;
// Una partícula cada ~22.000 px² de pantalla, con tope para pantallas grandes
const AREA_PER_PARTICLE = 22000;
const MAX_PARTICLES = 70;
// Velocidad en px por segundo: muy lenta a propósito
const MIN_SPEED = 3;
const MAX_SPEED = 9;

const random = (min: number, max: number) => min + Math.random() * (max - min);

const createParticle = (width: number, height: number): Particle => {
	const angle = random(-Math.PI * 0.85, -Math.PI * 0.15); // deriva hacia arriba
	const speed = random(MIN_SPEED, MAX_SPEED);
	return {
		x: random(0, width),
		y: random(0, height),
		radius: random(0.6, 2),
		velocityX: Math.cos(angle) * speed,
		velocityY: Math.sin(angle) * speed,
		alpha: random(0.15, 0.45),
		phase: random(0, Math.PI * 2),
	};
};

// Partículas claras que suben flotando muy despacio y titilan suavemente.
// Pensado como fondo decorativo sobre el verde de la marca (panel admin).
// Con "reducir movimiento" se dibujan una sola vez, sin animación.
export const ParticlesCanvas = ({ className }: Props) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext('2d');
		if (!canvas || !context) return;

		const reducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let width = 0;
		let height = 0;
		let particles: Particle[] = [];
		let frameId = 0;
		let lastTime = 0;

		const resize = () => {
			const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
			width = canvas.clientWidth;
			height = canvas.clientHeight;
			canvas.width = Math.round(width * pixelRatio);
			canvas.height = Math.round(height * pixelRatio);
			context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

			const count = Math.min(Math.round((width * height) / AREA_PER_PARTICLE), MAX_PARTICLES);
			particles = Array.from({ length: count }, () => createParticle(width, height));
		};

		const draw = (time: number) => {
			context.clearRect(0, 0, width, height);
			for (const particle of particles) {
				const twinkle = 0.65 + 0.35 * Math.sin(time / 1600 + particle.phase);
				const alpha = particle.alpha * twinkle;

				// Halo suave + núcleo
				context.beginPath();
				context.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
				context.fillStyle = `rgba(220, 243, 230, ${alpha * 0.18})`;
				context.fill();

				context.beginPath();
				context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
				context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
				context.fill();
			}
		};

		const step = (time: number) => {
			// Se limita el delta para que volver a una pestaña oculta no haga saltar las partículas
			const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
			lastTime = time;

			for (const particle of particles) {
				particle.x += particle.velocityX * delta;
				particle.y += particle.velocityY * delta;

				const margin = particle.radius * 3;
				if (particle.y < -margin) particle.y = height + margin;
				if (particle.x < -margin) particle.x = width + margin;
				if (particle.x > width + margin) particle.x = -margin;
			}

			draw(time);
			frameId = requestAnimationFrame(step);
		};

		resize();
		if (reducedMotion) {
			draw(0);
		} else {
			frameId = requestAnimationFrame(step);
		}

		const handleResize = () => {
			resize();
			if (reducedMotion) draw(0);
		};
		window.addEventListener('resize', handleResize);

		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return <canvas ref={canvasRef} aria-hidden='true' className={cn('pointer-events-none', className)} />;
};
