import { PointerGlowCanvas } from '../../ui/PointerGlowCanvas';

// Fondo del hero: shader WebGL en verdes con una luz que sigue al puntero.
// El degradado CSS queda debajo como respaldo si el navegador no tiene WebGL.
// Encima: un velo oscuro solo a la izquierda (detrás del texto, para el
// contraste) y un fundido inferior al color de la página, que lo mezcla con
// la sección siguiente.
export const HeroBackdrop = () => {
	return (
		<div aria-hidden='true' className='absolute inset-0 -z-10 overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800' />
			<PointerGlowCanvas className='absolute inset-0' />
			<div className='absolute inset-0 bg-gradient-to-r from-secondary-950/45 via-secondary-950/10 to-transparent' />
			<div className='absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-[#d3e0d8]' />
		</div>
	);
};
