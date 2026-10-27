import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from 'react-icons/fi';
import { cn } from '../../../helpers';
import { HeroSlide, heroSlides } from './heroContent';

const AUTOPLAY_MS = 5000;

const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	typeof window.matchMedia === 'function' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SlideContent = ({ slide, isActive }: { slide: HeroSlide; isActive: boolean }) => {
	if (slide.kind === 'image' && slide.fit === 'contain') {
		// Imagen completa (logo incluido) sobre una copia desenfocada que
		// rellena el marco; la leyenda va en la franja inferior libre.
		return (
			<figure className='relative flex h-full w-full flex-col'>
				<img
					src={slide.src}
					alt=''
					aria-hidden='true'
					loading={isActive ? 'eager' : 'lazy'}
					decoding='async'
					className='absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl'
				/>
				<div className='relative min-h-0 flex-1 px-3 pt-3'>
					<img
						src={slide.src}
						alt={slide.alt}
						width={784}
						height={1329}
						loading={isActive ? 'eager' : 'lazy'}
						decoding='async'
						className='fade-edges-soft h-full w-full object-contain'
					/>
				</div>
				<figcaption className='glass3d glass3d-light relative mx-4 mb-4 mt-2 rounded-xl px-4 py-2 text-center text-sm font-semibold text-neutral-800'>
					<span>{slide.caption}</span>
				</figcaption>
			</figure>
		);
	}

	if (slide.kind === 'image') {
		return (
			<figure className='relative h-full w-full'>
				<img
					src={slide.src}
					alt={slide.alt}
					width={784}
					height={1329}
					loading={isActive ? 'eager' : 'lazy'}
					decoding='async'
					className='fade-edges h-full w-full object-cover'
				/>
				<figcaption className='glass3d glass3d-light absolute inset-x-4 bottom-4 rounded-xl px-4 py-2 text-center text-sm font-semibold text-neutral-800'>
					<span>{slide.caption}</span>
				</figcaption>
			</figure>
		);
	}

	return (
		<div className='flex h-full flex-col items-start justify-center gap-4 px-7 text-white sm:px-9'>
			<span className='rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider'>
				{slide.eyebrow}
			</span>
			<p className='text-3xl font-extrabold leading-tight drop-shadow-sm sm:text-4xl'>
				{slide.title}
			</p>
			<p className='text-base font-medium text-white/90'>{slide.description}</p>
		</div>
	);
};

// Carrusel accesible con fundido cruzado: avanza solo cada 5 s, se pausa
// al pasar el mouse o enfocar un control, y no arranca solo si el usuario
// pidió movimiento reducido. Tiene botón de pausa (WCAG 2.2.2).
export const HeroCarousel = ({ className }: { className?: string }) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion());
	const [isHovered, setIsHovered] = useState(false);
	const total = heroSlides.length;

	const goTo = (index: number) => setActiveIndex((index + total) % total);

	useEffect(() => {
		if (!isPlaying || isHovered) return;
		const timer = window.setTimeout(
			() => setActiveIndex(current => (current + 1) % total),
			AUTOPLAY_MS
		);
		return () => window.clearTimeout(timer);
	}, [activeIndex, isPlaying, isHovered, total]);

	return (
		<section
			aria-roledescription='carrusel'
			aria-label='Por qué elegir Delivery’s Home'
			className={cn('w-full max-w-sm', className)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className='glass3d glass3d-orange rounded-[2rem] p-2'>
				<div
					aria-live={isPlaying ? 'off' : 'polite'}
					className='relative aspect-[4/5] overflow-hidden rounded-[1.6rem]'
				>
					{heroSlides.map((slide, index) => {
						const isActive = index === activeIndex;
						return (
							<div
								key={slide.id}
								role='group'
								aria-roledescription='diapositiva'
								aria-label={`${index + 1} de ${total}`}
								aria-hidden={!isActive}
								className={cn(
									'absolute inset-0 transition-all duration-700 ease-out',
									isActive ? 'scale-100 opacity-100' : 'pointer-events-none scale-105 opacity-0'
								)}
							>
								<SlideContent slide={slide} isActive={isActive} />
							</div>
						);
					})}
				</div>
			</div>

			<div className='mt-4 flex items-center justify-between gap-3'>
				<button
					type='button'
					onClick={() => setIsPlaying(playing => !playing)}
					aria-label={isPlaying ? 'Pausar carrusel' : 'Reproducir carrusel'}
					className='focus-ring rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30'
				>
					{isPlaying ? <FiPause aria-hidden='true' /> : <FiPlay aria-hidden='true' />}
				</button>

				<div className='flex items-center gap-2'>
					{heroSlides.map((slide, index) => (
						<button
							key={slide.id}
							type='button'
							onClick={() => goTo(index)}
							aria-label={`Ir a la diapositiva ${index + 1}`}
							aria-current={index === activeIndex}
							className={cn(
								'focus-ring h-2.5 rounded-full transition-all duration-300',
								index === activeIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
							)}
						/>
					))}
				</div>

				<div className='flex gap-2'>
					<button
						type='button'
						onClick={() => goTo(activeIndex - 1)}
						aria-label='Diapositiva anterior'
						className='focus-ring rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30'
					>
						<FiChevronLeft aria-hidden='true' />
					</button>
					<button
						type='button'
						onClick={() => goTo(activeIndex + 1)}
						aria-label='Diapositiva siguiente'
						className='focus-ring rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30'
					>
						<FiChevronRight aria-hidden='true' />
					</button>
				</div>
			</div>
		</section>
	);
};
