import { Outlet, useLocation } from 'react-router-dom';
import { Footer, Header, WhatsAppButton } from '../components/layout';
import { useActiveAgencyContact } from '../hooks';
import { DEFAULT_WHATSAPP_PHONE } from '../constants/whatsapp';

export const PublicLayout = () => {
	const { contact } = useActiveAgencyContact();
	const location = useLocation();

	return (
		<div className='flex min-h-screen flex-col font-montserrat'>
			<Header />

			<main className='flex-1'>
				{/* Transición suave (fade + slide) al navegar entre páginas de
				    la tienda: el `key` remonta el contenido en cada ruta. */}
				<div key={location.pathname} className='animate-page-in'>
					<Outlet />
				</div>
			</main>

			<Footer />

			<WhatsAppButton phone={contact?.whatsappPhone || DEFAULT_WHATSAPP_PHONE} />
		</div>
	);
};
