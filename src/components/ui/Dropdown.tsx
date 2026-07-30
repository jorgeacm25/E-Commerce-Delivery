import { useEffect, useRef, useState } from 'react';
import { cn } from '../../helpers';

export interface DropdownItem {
	label: string;
	value: string;
	icon?: React.ReactNode;
	danger?: boolean;
	disabled?: boolean;
}

interface Props {
	trigger: React.ReactNode;
	items: DropdownItem[];
	onSelect: (value: string) => void;
	align?: 'left' | 'right';
	className?: string;
}

export const Dropdown = ({ trigger, items, onSelect, align = 'left', className }: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handleOutsideClick = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setIsOpen(false);
		};

		document.addEventListener('mousedown', handleOutsideClick);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div ref={containerRef} className={cn('relative inline-block', className)}>
			<div
				role='button'
				tabIndex={0}
				aria-haspopup='menu'
				aria-expanded={isOpen}
				onClick={() => setIsOpen(v => !v)}
				onKeyDown={event => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						setIsOpen(v => !v);
					}
				}}
				className='focus-ring inline-block cursor-pointer rounded-lg'
			>
				{trigger}
			</div>

			{isOpen && (
				<div
					role='menu'
					className={cn(
						'absolute z-40 mt-2 min-w-[180px] rounded-xl border border-neutral-200 bg-white p-1.5 shadow-popover animate-scale-in',
						align === 'right' ? 'right-0' : 'left-0'
					)}
				>
					{items.map(item => (
						<button
							key={item.value}
							type='button'
							role='menuitem'
							disabled={item.disabled}
							onClick={() => {
								onSelect(item.value);
								setIsOpen(false);
							}}
							className={cn(
								'focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
								'disabled:cursor-not-allowed disabled:opacity-50',
								item.danger
									? 'text-danger-600 hover:bg-danger-50'
									: 'text-neutral-700 hover:bg-neutral-100'
							)}
						>
							{item.icon}
							{item.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};
