import { InputHTMLAttributes, forwardRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { cn } from '../../helpers';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	onClear?: () => void;
	containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, Props>(
	({ onClear, value, className, containerClassName, placeholder = 'Buscar...', ...rest }, ref) => {
		return (
			<div className={cn('relative flex items-center', containerClassName)}>
				<FiSearch className='absolute left-3 text-neutral-400' aria-hidden='true' />

				<input
					ref={ref}
					type='search'
					value={value}
					placeholder={placeholder}
					aria-label={placeholder}
					className={cn(
						'focus-ring w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors hover:border-neutral-400',
						className
					)}
					{...rest}
				/>

				{onClear && value && (
					<button
						type='button'
						onClick={onClear}
						aria-label='Limpiar búsqueda'
						className='focus-ring absolute right-2.5 rounded-md p-0.5 text-neutral-400 hover:text-neutral-700'
					>
						<FiX />
					</button>
				)}
			</div>
		);
	}
);

SearchInput.displayName = 'SearchInput';
