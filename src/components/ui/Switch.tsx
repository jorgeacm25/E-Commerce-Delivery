import { ButtonHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '../../helpers';

interface Props
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
	label?: string;
	description?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, Props>(
	({ label, description, checked, onChange, id, className, disabled, ...rest }, ref) => {
		const generatedId = useId();
		const switchId = id ?? generatedId;

		return (
			<div className='flex items-center gap-3'>
				<button
					ref={ref}
					id={switchId}
					type='button'
					role='switch'
					aria-checked={checked}
					disabled={disabled}
					onClick={() => onChange(!checked)}
					className={cn(
						'focus-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
						checked ? 'bg-primary-600' : 'bg-neutral-300',
						disabled && 'cursor-not-allowed opacity-50',
						className
					)}
					{...rest}
				>
					<span
						className={cn(
							'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
							checked ? 'translate-x-6' : 'translate-x-1'
						)}
					/>
				</button>

				{(label || description) && (
					<label htmlFor={switchId} className='flex flex-col cursor-pointer'>
						{label && (
							<span className='text-sm font-medium text-neutral-800'>{label}</span>
						)}
						{description && (
							<span className='text-xs text-neutral-500'>{description}</span>
						)}
					</label>
				)}
			</div>
		);
	}
);

Switch.displayName = 'Switch';
