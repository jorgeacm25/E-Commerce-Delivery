import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiTruck } from 'react-icons/fi';
import { FloatingLogo } from './hero/FloatingLogo';
import { HeroBackdrop } from './hero/HeroBackdrop';
import { HeroCarousel } from './hero/HeroCarousel';

// Hero de la portada sobre fondo verde con luz que sigue al puntero. La
// navbar se superpone a él (`data-header-overlay`, ver Header): de ahí el
// padding superior extra. Logo flotante + mensaje + CTA a la izquierda y
// carrusel en la esquina inferior derecha (en móvil todo se apila en una
// sola columna).
export const HeroSection = () => {
	return (
		<section data-header-overlay className='relative isolate overflow-hidden'>
			<HeroBackdrop />

			<div className='container flex flex-col gap-8 pb-20 pt-24 lg:min-h-[100svh] lg:pb-24'>
				<div className='grid flex-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end'>
					<div className='flex h-full flex-col items-center gap-8 text-center lg:items-start lg:justify-between lg:text-left'>
						<div className='flex w-full justify-center lg:pt-6'>
							<FloatingLogo />
						</div>

						<div className='flex flex-col items-center gap-5 lg:items-start'>
							<span className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-secondary-100 ring-1 ring-secondary-300/40'>
								<FiTruck aria-hidden='true' />
								Entregas a domicilio en toda Cuba
							</span>

							<h1 className='max-w-xl text-4xl font-semibold leading-[1.05] text-white drop-shadow-md sm:text-5xl lg:text-6xl'>
								Compra alimentos y combos para tu familia en Cuba, desde donde estés
							</h1>

							<p className='max-w-lg text-base font-medium text-white drop-shadow sm:text-lg'>
								Eliges el combo, pagas desde cualquier país y lo entregamos en la puerta de
								quien más quieres. Sin complicaciones, con seguimiento de principio a fin.
							</p>
						</div>

						<div className='flex flex-wrap items-center justify-center gap-3 lg:justify-start'>
							<Link
								to='/catalogo'
								className='focus-ring group inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-6 py-3.5 text-base font-bold text-neutral-950 shadow-lg shadow-primary-900/30 transition-all hover:-translate-y-0.5 hover:bg-primary-400'
							>
								Ver todos los productos
								<FiArrowRight
									aria-hidden='true'
									className='transition-transform group-hover:translate-x-1'
								/>
							</Link>
							<Link
								to='/rastrear-pedido'
								className='focus-ring inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/70 backdrop-blur-sm transition-colors hover:bg-white hover:text-secondary-800'
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
