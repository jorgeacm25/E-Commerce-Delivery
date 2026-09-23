import { cn } from '../../helpers';
import { Skeleton } from './Skeleton';

export type StatTrend = 'up' | 'down' | 'neutral';

interface Props {
	label: string;
	/** String plano o componente (p. ej. <AnimatedNumber/> para contadores). */
	value: React.ReactNode;
	icon?: React.ReactNode;
	trend?: StatTrend;
	trendLabel?: string;
	isLoading?: boolean;
	className?: string;
}

const trendClasses: Record<StatTrend, string> = {
	up: 'text-success-600',
	down: 'text-danger-600',
	neutral: 'text-neutral-500',
};

export const StatCard = ({
	label,
	value,
	icon,
	trend = 'neutral',
	trendLabel,
	isLoading = false,
	className,
}: Props) => {
	return (
		<div
			className={cn(
				'flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card',
				className
			)}
		>
			<div className='flex items-center justify-between'>
				<p className='text-sm font-medium text-neutral-500'>{label}</p>
				{icon && (
					<span className='flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600'>
						{icon}
					</span>
				)}
			</div>

			{isLoading ? (
				<Skeleton variant='text' className='h-7 w-24' />
			) : (
				<p className='text-2xl font-bold text-neutral-900'>{value}</p>
			)}

			{trendLabel && !isLoading && (
				<p className={cn('text-xs font-medium', trendClasses[trend])}>{trendLabel}</p>
			)}
		</div>
	);
};
