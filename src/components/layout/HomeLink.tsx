import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

// Acceso explícito a la portada, para quien no sepa que el logo también lleva a ella
export const HomeLink = () => (
	<Link
		to='/'
		aria-label='Ir al inicio'
		title='Inicio'
		className='focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15'
	>
		<FiHome className='text-xl' aria-hidden='true' />
	</Link>
);
