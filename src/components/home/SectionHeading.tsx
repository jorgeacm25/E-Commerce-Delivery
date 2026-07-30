import { cn } from '../../helpers';

interface Props {
	title: string;
	description?: string;
	className?: string;
}

export const SectionHeading = ({ title, description, className }: Props) => {
	return (
		<div className={cn('flex flex-col gap-1', className)}>
			<h2 className='text-xl font-bold text-neutral-900 sm:text-2xl'>{title}</h2>
			{description && <p className='max-w-2xl text-sm text-neutral-600'>{description}</p>}
		</div>
	);
};
