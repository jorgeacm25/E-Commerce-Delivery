import { FiInbox } from 'react-icons/fi';
import { cn } from '../../helpers';

interface Props {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

export const EmptyState = ({
	icon = <FiInbox aria-hidden='true' />,
	title,
	description,
	action,
	className,
}: Props) => {
	return (
		<div
			className={cn(
				'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center',
				className
			)}
		>
			<span className='flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-2xl text-neutral-400'>
				{icon}
			</span>

			<div>
				<p className='font-semibold text-neutral-800'>{title}</p>
				{description && <p className='mt-1 text-sm text-neutral-500'>{description}</p>}
			</div>

			{action}
		</div>
	);
};
