import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '../../helpers';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	containerClassName?: string;
}

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
			...rest
		},
		ref
	) => {
		const generatedId = useId();
		const inputId = id ?? generatedId;
		const hintId = hint ? `${inputId}-hint` : undefined;
		const errorId = error ? `${inputId}-error` : undefined;

		return (
			<div className={cn('flex flex-col gap-1.5', containerClassName)}>
				{label && (
					<label
						htmlFor={inputId}
						className='text-sm font-medium text-neutral-800'
					>
						{label}
						{required && <span className='text-danger-500 ml-0.5'>*</span>}
					</label>
				)}

				<div className='relative flex items-center'>
					{leftIcon && (
						<span className='absolute left-3 text-neutral-400 pointer-events-none'>
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
							'focus-ring w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors',
							'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
							error
								? 'border-danger-500 focus-visible:ring-danger-500'
								: 'border-neutral-400 hover:border-neutral-500',
							leftIcon && 'pl-9',
							rightIcon && 'pr-9',
							className
						)}
						{...rest}
					/>

					{rightIcon && (
						<span className='absolute right-3 text-neutral-400'>
							{rightIcon}
						</span>
					)}
				</div>

				{error ? (
					<p id={errorId} className='text-xs font-medium text-danger-600' role='alert'>
						{error}
					</p>
				) : hint ? (
					<p id={hintId} className='text-xs text-neutral-500'>
						{hint}
					</p>
				) : null}
			</div>
		);
	}
);

Input.displayName = 'Input';
