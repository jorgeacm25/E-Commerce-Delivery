import { Link } from 'react-router-dom';
import { footerLinks, footerQuickLinks, mainNavLinks } from '../../constants/navigation';
import { socialLinks } from '../../constants/links';
import { PointerGlowCanvas } from '../ui/PointerGlowCanvas';
import { Logo } from './Logo';

// Enlaces sobre el fondo verde: blanco suave que se ilumina al pasar el puntero
const linkClassName =
	'focus-ring rounded text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline';

// Pie con el mismo verde y la misma luz que sigue al puntero que el hero y la
// navbar. `scaleTo='viewport'` da al patrón el tamaño del hero aunque el pie
// sea más bajo; el fundido superior lo mezcla con el fondo de la página.
export const Footer = () => {
	return (
		<footer className='relative isolate overflow-hidden text-white'>
			<div aria-hidden='true' className='absolute inset-0 -z-10'>
				<div className='absolute inset-0 bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800' />
				<PointerGlowCanvas scaleTo='viewport' className='absolute inset-0' />
				<div className='absolute inset-0 bg-secondary-950/25' />
				<div className='page-gradient absolute inset-x-0 top-0 h-16 [mask-image:linear-gradient(to_bottom,#000,transparent)]' />
			</div>

			<div className='container grid gap-8 pb-10 pt-20 sm:grid-cols-2 lg:grid-cols-4'>
				<div className='flex flex-col gap-3'>
					<Logo tone='light' />
					<p className='text-sm text-white/85'>
						Alimentos y combos con entrega a destinatarios en Cuba.
					</p>
					<div className='flex gap-3 text-lg text-white/80'>
						{socialLinks.map(link => (
							<a
								key={link.id}
								href={link.href}
								target='_blank'
								rel='noopener noreferrer'
								aria-label={link.title}
								className='focus-ring rounded transition-colors hover:text-primary-300'
							>
								{link.icon}
							</a>
						))}
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<p className='text-sm font-semibold text-white'>Navegación</p>
					{mainNavLinks.map(link => (
						<Link
							key={link.href}
							to={link.href}
							className={linkClassName}
						>
							{link.label}
						</Link>
					))}
				</div>

				<div className='flex flex-col gap-2'>
					<p className='text-sm font-semibold text-white'>Ayuda</p>
					{footerLinks.map(link => (
						<Link
							key={link.href}
							to={link.href}
							className={linkClassName}
						>
							{link.label}
						</Link>
					))}
				</div>

				<div className='flex flex-col gap-2'>
					<p className='text-sm font-semibold text-white'>Contacto</p>
					<Link to='/contacto' className={linkClassName}>
						Escríbenos
					</Link>

					<p className='mt-4 text-sm font-semibold text-white'>Accesos rápidos</p>
					{footerQuickLinks.map(link => (
						<Link
							key={link.href}
							to={link.href}
							className={linkClassName}
						>
							{link.label}
						</Link>
					))}
				</div>
			</div>

			<div className='container border-t border-white/15 py-4 text-center text-xs text-white/70'>
				© {new Date().getFullYear()} Delivery Home. Todos los derechos reservados.
			</div>
		</footer>
	);
};
