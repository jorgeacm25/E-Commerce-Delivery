import { useId } from 'react';
import { cn } from '../../helpers';

export interface RadioOption {
	value: string;
	label: string;
	description?: string;
	disabled?: boolean;
}

interface Props {
	name?: string;
	label?: string;
	options: RadioOption[];
	value: string;
	onChange: (value: string) => void;
	error?: string;
	orientation?: 'vertical' | 'horizontal';
	className?: string;
}

export const RadioGroup = ({
	name,
	label,
	options,
	value,
	onChange,
	error,
	orientation = 'vertical',
	className,
}: Props) => {
	const generatedName = useId();
	const groupName = name ?? generatedName;

	return (
		<div
			role='radiogroup'
			aria-label={label}
			aria-invalid={!!error || undefined}
			className={cn('flex flex-col gap-2', className)}
		>
			{label && <span className='text-sm font-medium text-neutral-800'>{label}</span>}

			<div
				className={cn(
					'flex gap-3',
					orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
				)}
			>
				{options.map(option => {
					const optionId = `${groupName}-${option.value}`;

					return (
						<label
							key={option.value}
							htmlFor={optionId}
							className={cn(
								'inline-flex items-start gap-2',
								option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
							)}
						>
							<input
								id={optionId}
								type='radio'
								name={groupName}
								value={option.value}
								checked={value === option.value}
								disabled={option.disabled}
								onChange={() => onChange(option.value)}
								className={cn(
									'focus-ring mt-0.5 h-4 w-4 shrink-0 border-neutral-400 text-primary-600',
									error && 'border-danger-500'
								)}
							/>

							<span className='flex flex-col'>
								<span className='text-sm font-medium text-neutral-800'>
									{option.label}
								</span>
								{option.description && (
									<span className='text-xs text-neutral-500'>
										{option.description}
									</span>
								)}
							</span>
						</label>
					);
				})}
			</div>

			{error && (
				<p className='text-xs font-medium text-danger-600' role='alert'>
					{error}
				</p>
			)}
		</div>
	);
};
