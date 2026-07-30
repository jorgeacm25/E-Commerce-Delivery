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
				'animate-pulse bg-neutral-200',
				variant === 'text' && 'h-4 w-full rounded',
				variant === 'circle' && 'rounded-full',
				variant === 'rect' && 'rounded-lg',
				className
			)}
			{...rest}
		/>
	);
};
