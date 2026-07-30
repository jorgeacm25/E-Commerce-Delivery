import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { FiCheck } from 'react-icons/fi';
import { cn } from '../../helpers';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
	error?: string;
	description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, Props>(
	({ label, error, description, id, className, ...rest }, ref) => {
		const generatedId = useId();
		const checkboxId = id ?? generatedId;

		return (
			<div className='flex flex-col gap-1'>
				<label htmlFor={checkboxId} className='inline-flex items-start gap-2 cursor-pointer'>
					<span className='relative flex items-center justify-center mt-0.5'>
						<input
							ref={ref}
							id={checkboxId}
							type='checkbox'
							aria-invalid={!!error || undefined}
							className={cn(
								'peer focus-ring h-4 w-4 shrink-0 appearance-none rounded border border-neutral-400 bg-white transition-colors',
								'checked:border-primary-600 checked:bg-primary-600',
								'disabled:cursor-not-allowed disabled:opacity-50',
								error && 'border-danger-500',
								className
							)}
							{...rest}
						/>
						<FiCheck
							className='pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100'
							aria-hidden='true'
						/>
					</span>

					{(label || description) && (
						<span className='flex flex-col'>
							{label && (
								<span className='text-sm font-medium text-neutral-800'>{label}</span>
							)}
							{description && (
								<span className='text-xs text-neutral-500'>{description}</span>
							)}
						</span>
					)}
				</label>

				{error && (
					<p className='text-xs font-medium text-danger-600' role='alert'>
						{error}
					</p>
				)}
			</div>
		);
	}
);

Checkbox.displayName = 'Checkbox';
