import { Link } from 'react-router-dom';
import { heroNavItems } from './heroContent';

// Barra clara del hero con opciones estáticas (sin submenús). En móvil las
// opciones se desplazan horizontalmente en lugar de colapsar en un menú.
export const HeroNavbar = () => {
	return (
		<nav aria-label='Secciones destacadas' className='glass3d glass3d-light rounded-2xl'>
			<ul className='flex snap-x items-center gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] sm:justify-center sm:gap-2'>
				{heroNavItems.map(item => (
					<li key={item.label} className='shrink-0 snap-start'>
						<Link
							to={item.href}
							className='focus-ring block rounded-xl px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-white/80 hover:text-primary-700'
						>
							{item.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
};
