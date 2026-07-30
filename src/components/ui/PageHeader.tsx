import { cn } from '../../helpers';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

interface Props {
	title: string;
	description?: string;
	breadcrumb?: BreadcrumbItem[];
	actions?: React.ReactNode;
	className?: string;
}

export const PageHeader = ({ title, description, breadcrumb, actions, className }: Props) => {
	return (
		<div className={cn('flex flex-col gap-3', className)}>
			{breadcrumb && <Breadcrumb items={breadcrumb} />}

			<div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
				<div>
					<h1 className='text-xl font-bold text-neutral-900 sm:text-2xl'>{title}</h1>
					{description && <p className='mt-1 text-sm text-neutral-500'>{description}</p>}
				</div>

				{actions && <div className='flex shrink-0 gap-2'>{actions}</div>}
			</div>
		</div>
	);
};
