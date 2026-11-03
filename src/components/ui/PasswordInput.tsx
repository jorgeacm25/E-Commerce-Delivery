import { InputHTMLAttributes, forwardRef, useId, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { cn } from '../../helpers';
import { InputTone } from './Input';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label?: string;
	error?: string;
	hint?: string;
	containerClassName?: string;
	/** Igual que en Input: `brand` para los paneles verdes. */
	tone?: InputTone;
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
	(
		{ label, error, hint, id, className, containerClassName, required, tone = 'light', ...rest },
		ref
	) => {
		const [visible, setVisible] = useState(false);
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
					<input
						ref={ref}
						id={inputId}
						type={visible ? 'text' : 'password'}
						required={required}
						aria-invalid={!!error || undefined}
						aria-describedby={cn(hintId, errorId) || undefined}
						className={cn(
							'focus-ring w-full rounded-lg border px-3 py-2 pr-10 text-sm transition-colors',
							isBrand
								? 'bg-white/10 text-white placeholder:text-white/50 disabled:cursor-not-allowed disabled:opacity-60'
								: 'bg-white text-neutral-900 placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400',
							error
								? cn('focus-visible:ring-danger-500', isBrand ? 'border-red-300' : 'border-danger-500')
								: isBrand
									? 'border-white/30 hover:border-white/50'
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
						className={cn(
							'focus-ring absolute right-2 rounded-md p-1.5',
							isBrand
								? 'text-white/70 hover:bg-white/15 hover:text-white'
								: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
						)}
					>
						{visible ? <FiEyeOff aria-hidden='true' /> : <FiEye aria-hidden='true' />}
					</button>
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

PasswordInput.displayName = 'PasswordInput';
