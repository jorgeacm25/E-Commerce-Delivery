import { Outlet } from 'react-router-dom';
import { Footer, Header, WhatsAppButton } from '../components/layout';
import { useActiveAgencyContact } from '../hooks';
import { DEFAULT_WHATSAPP_PHONE } from '../constants/whatsapp';

export const PublicLayout = () => {
	const { contact } = useActiveAgencyContact();

	return (
		<div className='flex min-h-screen flex-col font-montserrat'>
			<Header />

			<main className='flex-1'>
				<Outlet />
			</main>

			<Footer />

			<WhatsAppButton phone={contact?.whatsappPhone || DEFAULT_WHATSAPP_PHONE} />
		</div>
	);
};
