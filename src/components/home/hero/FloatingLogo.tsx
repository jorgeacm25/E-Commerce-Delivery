// Logo oficial flotando como un globo de helio. La imagen trae fondo
// marfil, así que va dentro de un disco del mismo tono con
// `mix-blend-multiply` para que no se note el recorte. El tono marfil va
// fijo (no sale de la paleta) porque depende de la imagen, no del tema.
export const FloatingLogo = () => {
	return (
		<div className='flex flex-col items-center'>
			<div className='animate-float rounded-[2.5rem] bg-[#f2efeb] p-3 shadow-popover ring-4 ring-white/30 motion-reduce:animate-none'>
				<img
					src='/img/hero/logo-delivery-home.jpeg'
					alt='Delivery’s Home — Entregando hogar. Entregando cuidado.'
					width={1024}
					height={1024}
					className='h-36 w-36 rounded-[2rem] mix-blend-multiply sm:h-44 sm:w-44 lg:h-52 lg:w-52'
				/>
			</div>
			<div
				aria-hidden='true'
				className='mt-4 h-3 w-28 animate-float-shadow rounded-full bg-secondary-950 blur-md motion-reduce:animate-none sm:w-36'
			/>
		</div>
	);
};
