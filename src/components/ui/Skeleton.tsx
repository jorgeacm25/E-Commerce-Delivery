import { HTMLAttributes } from 'react';
import { cn } from '../../helpers';

interface Props extends HTMLAttributes<HTMLDivElement> {
	variant?: 'text' | 'circle' | 'rect';
}

export const Skeleton = ({ variant = 'rect', className, ...rest }: Props) => {
	return (
		<div
			aria-hidden='true'
			className={cn(
				// Shimmer: un degradado claro recorre el bloque de izquierda a derecha.
				// Con "reducir movimiento" se cae a un pulso suave sin desplazamiento.
				'relative isolate overflow-hidden bg-neutral-200',
				'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer',
				'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
				'motion-reduce:animate-pulse motion-reduce:before:hidden',
				variant === 'text' && 'h-4 w-full rounded',
				variant === 'circle' && 'rounded-full',
				variant === 'rect' && 'rounded-lg',
				className
			)}
			{...rest}
		/>
	);
};
