import { Link } from 'react-router-dom';
import { Button, EmptyState } from '../../components/ui';

export const NotFoundPage = () => {
	return (
		<div className='container flex flex-col items-center justify-center gap-4 py-20 text-center'>
			<EmptyState
				title='404 — Página no encontrada'
				description='La página que buscas no existe o fue movida.'
				action={
					<Link to='/'>
						<Button>Volver al inicio</Button>
					</Link>
				}
			/>
		</div>
	);
};
