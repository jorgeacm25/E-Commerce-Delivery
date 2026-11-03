import { CSSProperties } from 'react';
import { cn } from '../../helpers';

interface Props {
	/** Grosor del borde en px. */
	borderWidth?: number;
	/** Segundos que tarda el brillo en dar la vuelta completa. */
	duration?: number;
	/** Un color o varios para el degradado del brillo. */
	shineColor?: string | string[];
	className?: string;
}

// Adaptación del "Shine Border" de Magic UI (la misma que usa Cambute S.R.L.).
// Decorativo: un degradado radial enmascarado para que solo se vea en el
// borde, que se desplaza con la animación `shine` (tailwind.config.js). El
// padre debe tener `relative` y un `border-radius` que heredar. Con
// movimiento reducido el borde se queda quieto.
export const ShineBorder = ({
	borderWidth = 1,
	duration = 14,
	shineColor = '#ffffff',
	className,
}: Props) => {
	const colors = Array.isArray(shineColor) ? shineColor.join(',') : shineColor;

	const style = {
		'--duration': `${duration}s`,
		padding: `${borderWidth}px`,
		backgroundImage: `radial-gradient(transparent,transparent,${colors},transparent,transparent)`,
		backgroundSize: '300% 300%',
		mask: 'linear-gradient(#fff 0 0) content-box exclude, linear-gradient(#fff 0 0)',
		WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
		WebkitMaskComposite: 'xor',
	} as CSSProperties;

	return (
		<span
			aria-hidden='true'
			style={style}
			className={cn(
				'pointer-events-none absolute inset-0 rounded-[inherit] will-change-[background-position] motion-safe:animate-shine',
				className
			)}
		/>
	);
};
