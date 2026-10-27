// Fondo del hero: degradado naranja con manchas de color difusas, cubierto
// por una capa glass3d que las esmerila y añade el ruido de textura.
export const HeroBackdrop = () => {
	return (
		<div aria-hidden='true' className='absolute inset-0 -z-10 overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700' />
			<div className='absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-300/70' />
			<div className='absolute left-1/3 top-1/2 h-80 w-80 rounded-full bg-primary-400/80' />
			<div className='absolute -right-16 -top-10 h-96 w-96 rounded-full bg-white/40' />
			<div className='absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-primary-800/70' />
			<div className='glass3d glass3d-orange absolute inset-0 shadow-none' />
		</div>
	);
};
