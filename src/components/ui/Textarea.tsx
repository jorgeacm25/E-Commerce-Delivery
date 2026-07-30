import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '../../helpers';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	hint?: string;
	containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
	(
		{ label, error, hint, id, className, containerClassName, required, rows = 4, ...rest },
		ref
	) => {
		const generatedId = useId();
		const textareaId = id ?? generatedId;
		const hintId = hint ? `${textareaId}-hint` : undefined;
		const errorId = error ? `${textareaId}-error` : undefined;

		return (
			<div className={cn('flex flex-col gap-1.5', containerClassName)}>
				{label && (
					<label
						htmlFor={textareaId}
						className='text-sm font-medium text-neutral-800'
					>
						{label}
						{required && <span className='text-danger-500 ml-0.5'>*</span>}
					</label>
				)}

				<textarea
					ref={ref}
					id={textareaId}
					rows={rows}
					required={required}
					aria-invalid={!!error || undefined}
					aria-describedby={cn(hintId, errorId) || undefined}
					className={cn(
						'focus-ring w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors',
						'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
						error
							? 'border-danger-500 focus-visible:ring-danger-500'
							: 'border-neutral-300 hover:border-neutral-400',
						className
					)}
					{...rest}
				/>

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

Textarea.displayName = 'Textarea';
