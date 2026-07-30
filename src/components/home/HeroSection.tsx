import { Link } from 'react-router-dom';
import { FiSearch, FiTruck } from 'react-icons/fi';
import { Button } from '../ui/Button';

export const HeroSection = () => {
	return (
		<section className='container flex flex-col items-start gap-5 rounded-3xl bg-primary-50 px-6 py-12 sm:px-10'>
			<span className='inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700'>
				<FiTruck aria-hidden='true' />
				Entregas a domicilio en toda Cuba
			</span>

			<h1 className='max-w-xl text-3xl font-extrabold leading-tight text-neutral-900 sm:text-4xl'>
				Compra alimentos y combos para tu familia en Cuba, desde donde estés
			</h1>

			<p className='max-w-lg text-neutral-600'>
				Tú compras desde cualquier país; nosotros entregamos directamente al destinatario
				en Cuba, que puede ser un familiar o cualquier otra persona. Sigue cada pedido con
				su número de seguimiento.
			</p>

			<div className='flex flex-wrap gap-3'>
				<Link to='/catalogo'>
					<Button size='lg'>Comprar ahora</Button>
				</Link>
				<Link to='/rastrear-pedido'>
					<Button size='lg' variant='outline' leftIcon={<FiSearch aria-hidden='true' />}>
						Rastrear pedido
					</Button>
				</Link>
			</div>
		</section>
	);
};
