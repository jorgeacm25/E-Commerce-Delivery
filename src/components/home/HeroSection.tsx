import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiTruck } from 'react-icons/fi';
import { FloatingLogo } from './hero/FloatingLogo';
import { HeroBackdrop } from './hero/HeroBackdrop';
import { HeroCarousel } from './hero/HeroCarousel';
import { HeroNavbar } from './hero/HeroNavbar';

// Hero de la portada: barra clara arriba, logo flotante + mensaje + CTA a
// la izquierda y carrusel en la esquina inferior derecha (en móvil todo se
// apila en una sola columna).
export const HeroSection = () => {
	return (
		<section className='relative isolate overflow-hidden'>
			<HeroBackdrop />

			<div className='container flex flex-col gap-8 pb-12 pt-4 lg:min-h-[calc(100svh-4.5rem)] lg:pb-14'>
				<HeroNavbar />

				<div className='grid flex-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end'>
					<div className='flex h-full flex-col items-center gap-8 text-center lg:items-start lg:justify-between lg:text-left'>
						<div className='flex w-full justify-center lg:pt-6'>
							<FloatingLogo />
						</div>

						<div className='flex flex-col items-center gap-5 lg:items-start'>
							<span className='inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white'>
								<FiTruck aria-hidden='true' />
								Entregas a domicilio en toda Cuba
							</span>

							<h1 className='max-w-xl text-3xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl'>
								Compra alimentos y combos para tu familia en Cuba, desde donde estés
							</h1>

							<p className='max-w-lg text-base font-medium text-white/95 sm:text-lg'>
								Eliges el combo, pagas desde cualquier país y lo entregamos en la puerta de
								quien más quieres. Sin complicaciones, con seguimiento de principio a fin.
							</p>
						</div>

						<div className='flex flex-wrap items-center justify-center gap-3 lg:justify-start'>
							<Link
								to='/catalogo'
								className='focus-ring group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-primary-700 shadow-popover transition-all hover:-translate-y-0.5 hover:bg-primary-50'
							>
								Ver todos los productos
								<FiArrowRight
									aria-hidden='true'
									className='transition-transform group-hover:translate-x-1'
								/>
							</Link>
							<Link
								to='/rastrear-pedido'
								className='focus-ring inline-flex items-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/15'
							>
								<FiSearch aria-hidden='true' />
								Rastrear pedido
							</Link>
						</div>
					</div>

					<HeroCarousel className='justify-self-center lg:justify-self-end' />
				</div>
			</div>
		</section>
	);
};
