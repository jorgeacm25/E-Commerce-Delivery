import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '../../helpers';

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	hint?: string;
	options: SelectOption[];
	placeholder?: string;
	containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
	(
		{
			label,
			error,
			hint,
			options,
			placeholder,
			id,
			className,
			containerClassName,
			required,
			...rest
		},
		ref
	) => {
		const generatedId = useId();
		const selectId = id ?? generatedId;
		const hintId = hint ? `${selectId}-hint` : undefined;
		const errorId = error ? `${selectId}-error` : undefined;

		return (
			<div className={cn('flex flex-col gap-1.5', containerClassName)}>
				{label && (
					<label
						htmlFor={selectId}
						className='text-sm font-medium text-neutral-800'
					>
						{label}
						{required && <span className='text-danger-500 ml-0.5'>*</span>}
					</label>
				)}

				<div className='relative'>
					<select
						ref={ref}
						id={selectId}
						required={required}
						aria-invalid={!!error || undefined}
						aria-describedby={cn(hintId, errorId) || undefined}
						defaultValue={
							rest.value === undefined ? rest.defaultValue ?? (placeholder ? '' : undefined) : undefined
						}
						className={cn(
							'focus-ring w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-neutral-900 transition-colors',
							'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
							error
								? 'border-danger-500 focus-visible:ring-danger-500'
								: 'border-neutral-400 hover:border-neutral-500',
							className
						)}
						{...rest}
					>
						{placeholder && (
							<option value='' disabled>
								{placeholder}
							</option>
						)}
						{options.map(option => (
							<option
								key={option.value}
								value={option.value}
								disabled={option.disabled}
							>
								{option.label}
							</option>
						))}
					</select>

					<FiChevronDown
						className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400'
						aria-hidden='true'
					/>
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

Select.displayName = 'Select';
