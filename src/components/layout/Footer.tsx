import { Link } from 'react-router-dom';
import { footerLinks, footerQuickLinks, mainNavLinks } from '../../constants/navigation';
import { socialLinks } from '../../constants/links';
import { Logo } from './Logo';

export const Footer = () => {
	return (
		<footer className='border-t border-neutral-200 bg-neutral-50'>
			<div className='container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4'>
				<div className='flex flex-col gap-3'>
					<Logo />
					<p className='text-sm text-neutral-600'>
						Alimentos y combos con entrega a destinatarios en Cuba.
					</p>
					<div className='flex gap-3 text-lg text-neutral-500'>
						{socialLinks.map(link => (
							<a
								key={link.id}
								href={link.href}
								target='_blank'
								rel='noopener noreferrer'
								aria-label={link.title}
								className='focus-ring rounded hover:text-primary-600'
							>
								{link.icon}
							</a>
						))}
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<p className='text-sm font-semibold text-neutral-900'>Navegación</p>
					{mainNavLinks.map(link => (
						<Link
							key={link.href}
							to={link.href}
							className='text-sm text-neutral-600 hover:text-primary-700'
						>
							{link.label}
						</Link>
					))}
				</div>

				<div className='flex flex-col gap-2'>
					<p className='text-sm font-semibold text-neutral-900'>Ayuda</p>
					{footerLinks.map(link => (
						<Link
							key={link.href}
							to={link.href}
							className='text-sm text-neutral-600 hover:text-primary-700'
						>
							{link.label}
						</Link>
					))}
				</div>

				<div className='flex flex-col gap-2'>
					<p className='text-sm font-semibold text-neutral-900'>Contacto</p>
					<Link to='/contacto' className='text-sm text-neutral-600 hover:text-primary-700'>
						Escríbenos
					</Link>

					<p className='mt-4 text-sm font-semibold text-neutral-900'>Accesos rápidos</p>
					{footerQuickLinks.map(link => (
						<Link
							key={link.href}
							to={link.href}
							className='text-sm text-neutral-600 hover:text-primary-700'
						>
							{link.label}
						</Link>
					))}
				</div>
			</div>

			<div className='border-t border-neutral-200 py-4 text-center text-xs text-neutral-500'>
				© {new Date().getFullYear()} Delivery Home. Todos los derechos reservados.
			</div>
		</footer>
	);
};
