import { Link, NavLink } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { cn } from '../../helpers';
import { Badge } from '../ui';
import { adminNavigation } from '../../constants/adminNavigation';

interface Props {
	collapsed?: boolean;
	/** `light`: texto claro para el sidebar sobre el verde de la marca. */
	tone?: 'dark' | 'light';
	onNavigate?: () => void;
	className?: string;
}

export const AdminNavList = ({ collapsed = false, tone = 'dark', onNavigate, className }: Props) => {
	const isLight = tone === 'light';

	return (
		<nav className={cn('flex flex-col gap-1', className)}>
			{adminNavigation.map(item => {
				const Icon = item.icon;

				if (!item.isBuilt) {
					return (
						<div
							key={item.href}
							className={cn(
								'flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
								isLight ? 'text-white/45' : 'text-neutral-400'
							)}
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
								isLight
									? isActive
										? 'bg-white text-secondary-800 shadow-sm'
										: 'text-white/85 hover:bg-white/15 hover:text-white'
									: isActive
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

			{/* Salida a la tienda pública, separada de las secciones del panel */}
			<div className={cn('my-2 border-t', isLight ? 'border-white/20' : 'border-neutral-200')} />
			<Link
				to='/'
				onClick={onNavigate}
				title={collapsed ? 'Volver a la tienda' : undefined}
				className={cn(
					'focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
					isLight
						? 'text-white/85 hover:bg-white/15 hover:text-white'
						: 'text-neutral-700 hover:bg-neutral-100'
				)}
			>
				<FiHome aria-hidden='true' className='shrink-0 text-lg' />
				{!collapsed && <span className='truncate'>Volver a la tienda</span>}
			</Link>
		</nav>
	);
};
