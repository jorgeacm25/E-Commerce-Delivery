import { PointerGlowCanvas } from './PointerGlowCanvas';

// Fondo del hero: shader WebGL en verdes con una luz que sigue al puntero.
// El degradado CSS queda debajo como respaldo si el navegador no tiene WebGL.
export const HeroBackdrop = () => {
	return (
		<div aria-hidden='true' className='absolute inset-0 -z-10 overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-br from-secondary-800 via-secondary-900 to-secondary-950' />
			<PointerGlowCanvas className='absolute inset-0' />
		</div>
	);
};
