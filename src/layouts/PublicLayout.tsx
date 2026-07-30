import { Outlet } from 'react-router-dom';
import { Footer, Header, WhatsAppButton } from '../components/layout';

export const PublicLayout = () => {
	return (
		<div className='flex min-h-screen flex-col font-montserrat'>
			<Header />

			<main className='flex-1'>
				<Outlet />
			</main>

			<Footer />

			<WhatsAppButton />
		</div>
	);
};
