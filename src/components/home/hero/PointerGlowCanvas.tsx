import { useEffect, useRef } from 'react';
import { cn } from '../../../helpers';

// Colores de la paleta (secondary-950, secondary-700, secondary-400 y
// primary-500) en RGB normalizado para el shader.
const hexToRgb = (hex: string): [number, number, number] => {
	const value = parseInt(hex.slice(1), 16);
	return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

const SHADER_COLORS = {
	uDeep: hexToRgb('#0b2418'),
	uBase: hexToRgb('#21613f'),
	uMint: hexToRgb('#65bc9a'),
	uAccent: hexToRgb('#ff6f26'),
} as const;

const MAX_PIXEL_RATIO = 1.5;
// Suavizado del seguimiento del puntero (0 = no se mueve, 1 = instantáneo)
const POINTER_EASING = 0.08;

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
	gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Flujo orgánico (fbm con distorsión de dominio) en verdes + una luz que
// sigue al puntero, ilumina las crestas del flujo y lo empuja ligeramente.
const FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform vec3 uDeep;
uniform vec3 uBase;
uniform vec3 uMint;
uniform vec3 uAccent;

float hash(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
		mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
		u.y
	);
}

float fbm(vec2 p) {
	float value = 0.0;
	float amplitude = 0.5;
	mat2 rotation = mat2(0.8, 0.6, -0.6, 0.8);
	for (int i = 0; i < 4; i++) {
		value += amplitude * noise(p);
		p = rotation * p * 2.02;
		amplitude *= 0.5;
	}
	return value;
}

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	float aspect = uResolution.x / uResolution.y;
	vec2 p = vec2(uv.x * aspect, uv.y);
	vec2 pointer = vec2(uPointer.x * aspect, uPointer.y);

	vec2 toPointer = p - pointer;
	float dist = length(toPointer);
	float t = uTime * 0.06;

	vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + vec2(5.2, 1.3) - t));
	q += 1.4 * uPointerStrength * exp(-dist * dist * 5.0) * toPointer;

	float f = fbm(p * 2.0 + 2.4 * q + t * 1.4);

	vec3 color = mix(uDeep, uBase, smoothstep(0.15, 0.75, f));
	color = mix(color, uMint, smoothstep(0.6, 1.0, f) * 0.35);
	color += uAccent * smoothstep(0.62, 0.95, q.y) * 0.12;

	float glow = exp(-dist * dist * 12.0);
	float core = exp(-dist * dist * 140.0);
	color += uMint * glow * 0.35 * uPointerStrength;
	color += uMint * pow(f, 2.5) * glow * 0.9 * uPointerStrength;
	color += uAccent * exp(-dist * dist * 3.5) * 0.08 * uPointerStrength;
	color += vec3(1.0) * core * 0.22 * uPointerStrength;

	color *= 1.0 - 0.45 * length(uv - vec2(0.45, 0.5));
	color += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.03;

	gl_FragColor = vec4(color, 1.0);
}
`;

const getWebGLContext = (canvas: HTMLCanvasElement) => {
	try {
		return canvas.getContext('webgl', { antialias: false, alpha: false });
	} catch {
		return null;
	}
};

const compileShader = (gl: WebGLRenderingContext, type: number, source: string) => {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	return shader;
};

const createProgram = (gl: WebGLRenderingContext) => {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	if (!vertex || !fragment) return null;

	const program = gl.createProgram();
	if (!program) return null;
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
	return program;
};

// Fondo animado con WebGL: luz que sigue al puntero sobre un flujo de
// verdes. Si no hay puntero (móvil, teclado) la luz deriva sola. Sin WebGL
// queda el degradado CSS de abajo. Con movimiento reducido se pinta un solo
// cuadro fijo, y la animación se pausa fuera de pantalla o con la pestaña
// oculta para no gastar batería.
export const PointerGlowCanvas = ({ className }: { className?: string }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = getWebGLContext(canvas);
		if (!gl) return;

		const program = createProgram(gl);
		if (!program) return;
		gl.useProgram(program);

		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
		const positionLocation = gl.getAttribLocation(program, 'aPosition');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		const uniform = (name: string) => gl.getUniformLocation(program, name);
		const uResolution = uniform('uResolution');
		const uTime = uniform('uTime');
		const uPointer = uniform('uPointer');
		const uPointerStrength = uniform('uPointerStrength');
		for (const [name, rgb] of Object.entries(SHADER_COLORS)) {
			gl.uniform3fv(uniform(name), rgb);
		}

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Posición del puntero en coordenadas 0..1 del canvas (y hacia arriba)
		const target = { x: 0.7, y: 0.6 };
		const current = { x: 0.7, y: 0.6 };
		let hasPointer = false;
		let strength = 0.6;
		let frameId = 0;
		let isVisible = true;
		const startTime = performance.now();

		const resize = () => {
			const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
			const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
			const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}
			gl.viewport(0, 0, width, height);
			gl.uniform2f(uResolution, width, height);
		};

		const draw = (now: number) => {
			const seconds = (now - startTime) / 1000;
			if (!hasPointer) {
				target.x = 0.62 + 0.25 * Math.sin(seconds * 0.23);
				target.y = 0.5 + 0.22 * Math.sin(seconds * 0.31 + 1.2);
			}
			current.x += (target.x - current.x) * POINTER_EASING;
			current.y += (target.y - current.y) * POINTER_EASING;
			strength += ((hasPointer ? 1 : 0.6) - strength) * 0.05;

			gl.uniform1f(uTime, seconds);
			gl.uniform2f(uPointer, current.x, current.y);
			gl.uniform1f(uPointerStrength, strength);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		};

		const loop = (now: number) => {
			draw(now);
			frameId = requestAnimationFrame(loop);
		};

		const start = () => {
			if (reducedMotion || frameId || !isVisible || document.hidden) return;
			frameId = requestAnimationFrame(loop);
		};

		const stop = () => {
			cancelAnimationFrame(frameId);
			frameId = 0;
		};

		const handlePointerMove = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width;
			const y = 1 - (event.clientY - rect.top) / rect.height;
			hasPointer = x >= 0 && x <= 1 && y >= 0 && y <= 1;
			if (hasPointer) {
				target.x = x;
				target.y = y;
			}
		};

		const handlePointerLeave = () => {
			hasPointer = false;
		};

		const handleVisibilityChange = () => (document.hidden ? stop() : start());

		const resizeObserver = new ResizeObserver(() => {
			resize();
			if (reducedMotion) draw(startTime);
		});
		resizeObserver.observe(canvas);

		const intersectionObserver = new IntersectionObserver(([entry]) => {
			isVisible = entry.isIntersecting;
			if (isVisible) start();
			else stop();
		});
		intersectionObserver.observe(canvas);

		resize();
		draw(startTime);
		start();

		if (!reducedMotion) {
			window.addEventListener('pointermove', handlePointerMove, { passive: true });
			document.documentElement.addEventListener('pointerleave', handlePointerLeave);
		}
		document.addEventListener('visibilitychange', handleVisibilityChange);
		canvas.addEventListener('webglcontextlost', stop);

		return () => {
			stop();
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			window.removeEventListener('pointermove', handlePointerMove);
			document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			canvas.removeEventListener('webglcontextlost', stop);
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
		};
	}, []);

	return <canvas ref={canvasRef} aria-hidden='true' className={cn('block h-full w-full', className)} />;
};
