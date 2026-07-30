import { ButtonHTMLAttributes, forwardRef } from 'react';
import { FiLoader } from 'react-icons/fi';
import { cn } from '../../helpers';

export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'outline'
	| 'ghost'
	| 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	fullWidth?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300',
	secondary:
		'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 disabled:bg-secondary-300',
	outline:
		'border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50 active:bg-neutral-100 disabled:text-neutral-400 disabled:bg-white',
	ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400',
	danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 disabled:bg-danger-300',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'text-xs px-3 py-1.5 gap-1.5',
	md: 'text-sm px-4 py-2 gap-2',
	lg: 'text-base px-5 py-2.5 gap-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
	(
		{
			variant = 'primary',
			size = 'md',
			isLoading = false,
			fullWidth = false,
			leftIcon,
			rightIcon,
			disabled,
			className,
			children,
			...rest
		},
		ref
	) => {
		return (
			<button
				ref={ref}
				disabled={disabled || isLoading}
				aria-busy={isLoading || undefined}
				className={cn(
					'focus-ring inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed',
					variantClasses[variant],
					sizeClasses[size],
					fullWidth && 'w-full',
					className
				)}
				{...rest}
			>
				{isLoading ? (
					<FiLoader className='animate-spin-slow' aria-hidden='true' />
				) : (
					leftIcon
				)}
				{children}
				{!isLoading && rightIcon}
			</button>
		);
	}
);

Button.displayName = 'Button';
