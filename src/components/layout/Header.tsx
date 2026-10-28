import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { mainNavLinks } from '../../constants/navigation';
import { cn } from '../../helpers';
import { PointerGlowCanvas } from '../ui/PointerGlowCanvas';
import { Logo } from './Logo';
import { CategoryNav } from './CategoryNav';
import { CartLink } from './CartLink';
import { AccountLink } from './AccountLink';
import { MobileMenu } from './MobileMenu';

/** Alto fijo de la barra (h-16): el hero lo descuenta en su padding superior. */
const HEADER_HEIGHT = 64;

// Selector del hero que la barra "continúa" visualmente (ver HeroSection)
const HERO_SELECTOR = '[data-header-overlay]';

/**
 * - `overlay`: arriba del todo sobre el hero, transparente; barra y hero se
 *   ven como un solo bloque con el mismo shader.
 * - `glass`: aún sobre el hero pero con scroll; vidrio verde esmerilado para
 *   que el contenido que pasa por debajo no se mezcle con los enlaces.
 * - `solid`: sin hero debajo (resto de la portada u otras páginas); la barra
 *   pinta su propio shader verde con la luz que sigue al puntero.
 */
type HeaderMode = 'overlay' | 'glass' | 'solid';

const useHeaderMode = (hasHero: boolean): HeaderMode => {
	const [mode, setMode] = useState<HeaderMode>(hasHero ? 'overlay' : 'solid');

	useEffect(() => {
		if (!hasHero) {
			setMode('solid');
			return;
		}

		let frameId = 0;
		const update = () => {
			frameId = 0;
			// La portada se carga en diferido: si el hero aún no está en el DOM
			// se asume que sí estará (arriba del todo), en vez de pasar a sólido.
			const hero = document.querySelector(HERO_SELECTOR);
			if (hero && hero.getBoundingClientRect().bottom <= HEADER_HEIGHT) setMode('solid');
			else setMode(window.scrollY > 8 ? 'glass' : 'overlay');
		};
		const requestUpdate = () => {
			if (!frameId) frameId = requestAnimationFrame(update);
		};

		update();
		window.addEventListener('scroll', requestUpdate, { passive: true });
		window.addEventListener('resize', requestUpdate);
		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener('scroll', requestUpdate);
			window.removeEventListener('resize', requestUpdate);
		};
	}, [hasHero]);

	return mode;
};

// Barra superior con el mismo verde y la misma animación que el hero. En la
// portada se superpone al hero (margen inferior negativo) para fundirse con él.
export const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { pathname } = useLocation();
	const hasHero = pathname === '/';
	const mode = useHeaderMode(hasHero);

	// El menú móvil va fuera del <header>: su `backdrop-filter` (modo glass)
	// convertiría a la barra en el contenedor de los elementos `fixed`.
	return (
		<>
			<header
				className={cn(
					'sticky top-0 z-20 h-16 transition-[background-color,box-shadow] duration-300',
					hasHero && '-mb-16',
					mode === 'overlay' && 'bg-transparent',
					mode === 'glass' && 'bg-secondary-900/40 shadow-lg shadow-secondary-950/10 backdrop-blur-md',
					mode === 'solid' && 'bg-secondary-800 shadow-lg shadow-secondary-950/20'
				)}
			>
				<div
					aria-hidden='true'
					className={cn(
						'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500',
						mode === 'solid' ? 'opacity-100' : 'opacity-0'
					)}
				>
					<PointerGlowCanvas scaleTo='viewport' className='absolute inset-0' />
					<div className='absolute inset-0 bg-secondary-950/25' />
				</div>

				<div className='container relative flex h-full items-center gap-4'>
					<button
						type='button'
						aria-label='Abrir menú'
						title='Abrir menú'
						className='focus-ring inline-flex items-center justify-center rounded-full p-2 text-base text-white transition-colors hover:bg-white/15 lg:hidden'
						onClick={() => setIsMenuOpen(true)}
					>
						<FiMenu aria-hidden='true' />
					</button>

					<Logo tone='light' />

					<nav className='hidden items-center gap-6 lg:flex'>
						{mainNavLinks.map(link => (
							<NavLink
								key={link.href}
								to={link.href}
								className={({ isActive }) =>
									cn(
										'text-sm font-medium underline-offset-8 transition-colors',
										isActive
											? 'text-white underline decoration-primary-400 decoration-2'
											: 'text-white/85 hover:text-white'
									)
								}
							>
								{link.label}
							</NavLink>
						))}
						<CategoryNav />
					</nav>

					<div className='ml-auto flex items-center gap-2'>
						<AccountLink />
						<CartLink />
					</div>
				</div>
			</header>

			<MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
		</>
	);
};
