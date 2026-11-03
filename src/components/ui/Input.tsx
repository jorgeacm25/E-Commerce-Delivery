import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '../../helpers';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	containerClassName?: string;
	/**
	 * - `light`: sobre fondo claro (por defecto).
	 * - `brand`: sobre los paneles verdes (ver Drawer `tone='brand'`); campo
	 *   translúcido con texto blanco.
	 */
	tone?: InputTone;
}

export type InputTone = 'light' | 'brand';

export const Input = forwardRef<HTMLInputElement, Props>(
	(
		{
			label,
			error,
			hint,
			leftIcon,
			rightIcon,
			id,
			className,
			containerClassName,
			required,
			tone = 'light',
			...rest
		},
		ref
	) => {
		const generatedId = useId();
		const inputId = id ?? generatedId;
		const hintId = hint ? `${inputId}-hint` : undefined;
		const errorId = error ? `${inputId}-error` : undefined;
		const isBrand = tone === 'brand';

		return (
			<div className={cn('flex flex-col gap-1.5', containerClassName)}>
				{label && (
					<label
						htmlFor={inputId}
						className={cn('text-sm font-medium', isBrand ? 'text-white' : 'text-neutral-800')}
					>
						{label}
						{required && (
							<span className={cn('ml-0.5', isBrand ? 'text-red-200' : 'text-danger-500')}>*</span>
						)}
					</label>
				)}

				<div className='relative flex items-center'>
					{leftIcon && (
						<span
							className={cn(
								'absolute left-3 pointer-events-none',
								isBrand ? 'text-white/60' : 'text-neutral-400'
							)}
						>
							{leftIcon}
						</span>
					)}

					<input
						ref={ref}
						id={inputId}
						required={required}
						aria-invalid={!!error || undefined}
						aria-describedby={cn(hintId, errorId) || undefined}
						className={cn(
							'focus-ring w-full rounded-lg border px-3 py-2 text-sm transition-colors',
							isBrand
								? 'bg-white/10 text-white placeholder:text-white/50 disabled:cursor-not-allowed disabled:opacity-60'
								: 'bg-white text-neutral-900 placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
							error
								? cn('focus-visible:ring-danger-500', isBrand ? 'border-red-300' : 'border-danger-500')
								: isBrand
									? 'border-white/30 hover:border-white/50'
									: 'border-neutral-400 hover:border-neutral-500',
							leftIcon && 'pl-9',
							rightIcon && 'pr-9',
							className
						)}
						{...rest}
					/>

					{rightIcon && (
						<span className={cn('absolute right-3', isBrand ? 'text-white/60' : 'text-neutral-400')}>
							{rightIcon}
						</span>
					)}
				</div>

				{error ? (
					<p
						id={errorId}
						className={cn('text-xs font-medium', isBrand ? 'text-red-200' : 'text-danger-600')}
						role='alert'
					>
						{error}
					</p>
				) : hint ? (
					<p id={hintId} className={cn('text-xs', isBrand ? 'text-white/70' : 'text-neutral-500')}>
						{hint}
					</p>
				) : null}
			</div>
		);
	}
);

Input.displayName = 'Input';
