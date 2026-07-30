import { InputHTMLAttributes, forwardRef, useId, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { cn } from '../../helpers';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
	error?: string;
	hint?: string;
	containerClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
	(
		{ label, error, hint, id, className, containerClassName, required, ...rest },
		ref
	) => {
		const [visible, setVisible] = useState(false);
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
					<input
						ref={ref}
						id={inputId}
						type={visible ? 'text' : 'password'}
						required={required}
						aria-invalid={!!error || undefined}
						aria-describedby={cn(hintId, errorId) || undefined}
						className={cn(
							'focus-ring w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors',
							'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
							error
								? 'border-danger-500 focus-visible:ring-danger-500'
								: 'border-neutral-300 hover:border-neutral-400',
							className
						)}
						{...rest}
					/>

					<button
						type='button'
						onClick={() => setVisible(v => !v)}
						aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
						aria-pressed={visible}
						className='focus-ring absolute right-2 rounded-md p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
					>
						{visible ? <FiEyeOff aria-hidden='true' /> : <FiEye aria-hidden='true' />}
					</button>
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

PasswordInput.displayName = 'PasswordInput';
