import { ButtonHTMLAttributes, forwardRef } from 'react';
import { FiLoader } from 'react-icons/fi';
import { cn } from '../../helpers';
import { ButtonVariant, ButtonSize } from './Button';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: React.ReactNode;
	label: string;
	variant?: Extract<ButtonVariant, 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>;
	size?: ButtonSize;
	isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300',
	secondary:
		'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 disabled:bg-secondary-300',
	outline:
		'border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-50 active:bg-neutral-100 disabled:text-neutral-400',
	ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400',
	danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 disabled:bg-danger-300',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'p-1.5 text-sm',
	md: 'p-2 text-base',
	lg: 'p-2.5 text-lg',
};

export const IconButton = forwardRef<HTMLButtonElement, Props>(
	(
		{
			icon,
			label,
			variant = 'ghost',
			size = 'md',
			isLoading = false,
			disabled,
			className,
			...rest
		},
		ref
	) => {
		return (
			<button
				ref={ref}
				type='button'
				aria-label={label}
				title={label}
				disabled={disabled || isLoading}
				aria-busy={isLoading || undefined}
				className={cn(
					'focus-ring inline-flex items-center justify-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed',
					variantClasses[variant],
					sizeClasses[size],
					className
				)}
				{...rest}
			>
				{isLoading ? (
					<FiLoader className='animate-spin-slow' aria-hidden='true' />
				) : (
					icon
				)}
			</button>
		);
	}
);

IconButton.displayName = 'IconButton';
