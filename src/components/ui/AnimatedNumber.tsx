import { useEffect, useRef, useState } from 'react';

interface Props {
	/** Valor YA formateado, ej: "$1,234.56", "1.234,56 CUP", "12" o "—". */
	value: string;
	/** Duración de la animación en ms. */
	duration?: number;
	className?: string;
}

// Información del primer número encontrado en el string formateado,
// para poder reconstruirlo con el mismo formato mientras se anima.
interface ParsedNumber {
	prefix: string;
	suffix: string;
	target: number;
	grouping: '.' | ',' | '';
	decimal: '.' | ',' | '';
	decimals: number;
}

const NUMBER_TOKEN = /\d[\d.,]*/;

const parseFormatted = (value: string): ParsedNumber | null => {
	const match = NUMBER_TOKEN.exec(value);
	if (!match || match.index === undefined) return null;

	const token = match[0];
	const hasComma = token.includes(',');
	const hasDot = token.includes('.');

	let grouping: '.' | ',' | '' = '';
	let decimal: '.' | ',' | '' = '';

	if (hasComma && hasDot) {
		// El último separador presente es el decimal
		// ("1,234.56" en-US / "1.234,56" es-CU)
		decimal = token.lastIndexOf(',') > token.lastIndexOf('.') ? ',' : '.';
		grouping = decimal === ',' ? '.' : ',';
	} else if (hasComma || hasDot) {
		const sep: '.' | ',' = hasComma ? ',' : '.';
		const parts = token.split(sep);
		const trailing = parts[1] ?? '';
		// Varias apariciones ("1.234.567") o exactamente3 dígitos
		// después ("1,234") => agrupación de miles; si no, es decimal.
		if (parts.length - 1 > 1 || trailing.length === 3) {
			grouping = sep;
		} else {
			decimal = sep;
		}
	}

	const decimals = decimal ? (token.split(decimal)[1]?.length ?? 0) : 0;

	const normalized = grouping ? token.split(grouping).join('') : token;
	const numeric = Number(
		decimal && decimal !== '.' ? normalized.replace(decimal, '.') : normalized
	);

	if (Number.isNaN(numeric)) return null;

	return {
		prefix: value.slice(0, match.index),
		suffix: value.slice(match.index + token.length),
		target: numeric,
		grouping,
		decimal,
		decimals,
	};
};

// Reconstruye el número interpolado con el mismo formato que el original.
const formatAnimated = (n: number, p: ParsedNumber): string => {
	let core: string;

	if (p.decimal) {
		core = n.toLocaleString(p.decimal === ',' ? 'de-DE' : 'en-US', {
			minimumFractionDigits: p.decimals,
			maximumFractionDigits: p.decimals,
		});
	} else if (p.grouping) {
		core = Math.round(n).toLocaleString(p.grouping === ',' ? 'en-US' : 'de-DE');
	} else if (p.decimals > 0) {
		core = n.toFixed(p.decimals);
	} else {
		core = String(Math.round(n));
	}

	return `${p.prefix}${core}${p.suffix}`;
};

// Cuenta desde0 (o desde el valor anterior) hasta el valor final con
// ease-out. Si no hay número en el string ("—") o el usuario pide
// menos movimiento, se muestra el valor final directamente.
export const AnimatedNumber = ({ value, duration = 800, className }: Props) => {
	const [display, setDisplay] = useState(() => {
		const parsed = parseFormatted(value);
		return parsed ? formatAnimated(0, parsed) : value;
	});
	const displayedRef = useRef(0);
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		const parsed = parseFormatted(value);

		if (!parsed) {
			setDisplay(value);
			return;
		}

		const prefersReducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const canAnimate = typeof requestAnimationFrame === 'function';

		const from = displayedRef.current;
		const to = parsed.target;

		if (prefersReducedMotion || !canAnimate || from === to) {
			displayedRef.current = to;
			setDisplay(formatAnimated(to, parsed));
			return;
		}

		const start = performance.now();

		const tick = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
			setDisplay(formatAnimated(from + (to - from) * eased, parsed));

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(tick);
			} else {
				displayedRef.current = to;
				setDisplay(formatAnimated(to, parsed));
			}
		};

		frameRef.current = requestAnimationFrame(tick);

		return () => {
			if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
			// Un cambio de valor durante la animación continúa desde el
			// último objetivo alcanzado (evita saltos bruscos).
			displayedRef.current = to;
		};
	}, [value, duration]);

	return <span className={className}>{display}</span>;
};
