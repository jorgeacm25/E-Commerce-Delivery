import { cn } from '../../helpers';

export interface TabItem {
	label: string;
	value: string;
	icon?: React.ReactNode;
	disabled?: boolean;
}

interface Props {
	tabs: TabItem[];
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export const Tabs = ({ tabs, value, onChange, className }: Props) => {
	return (
		<div
			role='tablist'
			className={cn('flex gap-1 border-b border-neutral-200', className)}
		>
			{tabs.map(tab => {
				const isActive = tab.value === value;

				return (
					<button
						key={tab.value}
						type='button'
						role='tab'
						aria-selected={isActive}
						disabled={tab.disabled}
						onClick={() => onChange(tab.value)}
						className={cn(
							'focus-ring -mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
							'disabled:cursor-not-allowed disabled:opacity-50',
							isActive
								? 'border-primary-600 text-primary-700'
								: 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
						)}
					>
						{tab.icon}
						{tab.label}
					</button>
				);
			})}
		</div>
	);
};
