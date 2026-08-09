import { NavLink } from 'react-router-dom';
import { cn } from '../../helpers';
import { Badge } from '../ui';
import { adminNavigation } from '../../constants/adminNavigation';

interface Props {
	collapsed?: boolean;
	onNavigate?: () => void;
	className?: string;
}

export const AdminNavList = ({ collapsed = false, onNavigate, className }: Props) => {
	return (
		<nav className={cn('flex flex-col gap-1', className)}>
			{adminNavigation.map(item => {
				const Icon = item.icon;

				if (!item.isBuilt) {
					return (
						<div
							key={item.href}
							className='flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400'
							title={`${item.label} — próximamente (Fase ${item.phase})`}
						>
							<Icon aria-hidden='true' className='shrink-0 text-lg' />
							{!collapsed && (
								<span className='flex flex-1 items-center justify-between gap-2 truncate'>
									{item.label}
									<Badge variant='neutral' className='shrink-0'>
										Próximamente
									</Badge>
								</span>
							)}
						</div>
					);
				}

				return (
					<NavLink
						key={item.href}
						to={item.href}
						end={item.href === '/admin'}
						onClick={onNavigate}
						title={collapsed ? item.label : undefined}
						className={({ isActive }) =>
							cn(
								'focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								isActive
									? 'bg-primary-50 text-primary-700'
									: 'text-neutral-700 hover:bg-neutral-100'
							)
						}
					>
						<Icon aria-hidden='true' className='shrink-0 text-lg' />
						{!collapsed && <span className='truncate'>{item.label}</span>}
					</NavLink>
				);
			})}
		</nav>
	);
};
