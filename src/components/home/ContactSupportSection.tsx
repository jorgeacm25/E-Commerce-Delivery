import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa6';
import { FiHelpCircle, FiMail } from 'react-icons/fi';
import { Button } from '../ui/Button';
import {
	DEFAULT_WHATSAPP_MESSAGE,
	DEFAULT_WHATSAPP_PHONE,
	buildWhatsAppUrl,
} from '../../constants/whatsapp';
import { useActiveAgencyContact } from '../../hooks';
import { SectionHeading } from './SectionHeading';

export const ContactSupportSection = () => {
	const { contact } = useActiveAgencyContact();
	const whatsappPhone = contact?.whatsappPhone || DEFAULT_WHATSAPP_PHONE;

	return (
		<section className='container flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white px-6 py-10 sm:px-10'>
			<SectionHeading
				title='Contacto y soporte'
				description='¿Tienes dudas sobre tu pedido o el destinatario en Cuba? Escríbenos, respondemos en español.'
			/>

			<div className='flex flex-wrap gap-3'>
				<a
					href={buildWhatsAppUrl(whatsappPhone, DEFAULT_WHATSAPP_MESSAGE)}
					target='_blank'
					rel='noopener noreferrer'
				>
					<Button leftIcon={<FaWhatsapp aria-hidden='true' />}>WhatsApp</Button>
				</a>

				<Link to='/contacto'>
					<Button variant='outline' leftIcon={<FiMail aria-hidden='true' />}>
						Formulario de contacto
					</Button>
				</Link>

				<Link to='/preguntas-frecuentes'>
					<Button variant='ghost' leftIcon={<FiHelpCircle aria-hidden='true' />}>
						Centro de ayuda
					</Button>
				</Link>
			</div>
		</section>
	);
};
