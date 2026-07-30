import { HTMLAttributes } from 'react';
import { cn } from '../../helpers';

export type BadgeVariant = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface Props extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
	neutral: 'bg-neutral-100 text-neutral-700',
	primary: 'bg-primary-100 text-primary-700',
	secondary: 'bg-secondary-100 text-secondary-700',
	success: 'bg-success-50 text-success-700',
	warning: 'bg-warning-50 text-warning-700',
	danger: 'bg-danger-50 text-danger-700',
};

export const Badge = ({ variant = 'neutral', className, children, ...rest }: Props) => {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
				variantClasses[variant],
				className
			)}
			{...rest}
		>
			{children}
		</span>
	);
};
