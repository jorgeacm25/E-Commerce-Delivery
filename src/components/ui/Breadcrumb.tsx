import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { cn } from '../../helpers';

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface Props {
	items: BreadcrumbItem[];
	className?: string;
}

export const Breadcrumb = ({ items, className }: Props) => {
	return (
		<nav aria-label='Ruta de navegación' className={cn(className)}>
			<ol className='flex flex-wrap items-center gap-1.5 text-sm text-neutral-500'>
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<li key={`${item.label}-${index}`} className='flex items-center gap-1.5'>
							{item.href && !isLast ? (
								<Link
									to={item.href}
									className='focus-ring rounded hover:text-primary-700 hover:underline'
								>
									{item.label}
								</Link>
							) : (
								<span
									aria-current={isLast ? 'page' : undefined}
									className={isLast ? 'font-medium text-neutral-900' : undefined}
								>
									{item.label}
								</span>
							)}

							{!isLast && <FiChevronRight aria-hidden='true' className='text-neutral-400' />}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};
