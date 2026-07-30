import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const CtaSection = () => {
	return (
		<section className='container flex flex-col items-start gap-4 rounded-3xl bg-neutral-900 px-6 py-10 text-white sm:px-10'>
			<h2 className='max-w-lg text-2xl font-bold'>
				Lleva hoy lo que tu familia necesita en Cuba
			</h2>
			<p className='max-w-lg text-neutral-300'>
				Elige un combo o arma tu pedido, indica quién lo recibe en Cuba y nosotros nos
				encargamos del resto.
			</p>
			<div className='flex flex-wrap gap-3'>
				<Link to='/catalogo'>
					<Button size='lg'>Ver catálogo</Button>
				</Link>
				<Link to='/registrarse'>
					<Button size='lg' variant='secondary'>
						Crear cuenta
					</Button>
				</Link>
			</div>
		</section>
	);
};
