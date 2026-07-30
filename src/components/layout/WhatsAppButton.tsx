import { FaWhatsapp } from 'react-icons/fa6';
import { cn } from '../../helpers';
import {
	DEFAULT_WHATSAPP_MESSAGE,
	DEFAULT_WHATSAPP_PHONE,
	buildWhatsAppUrl,
} from '../../constants/whatsapp';

interface Props {
	phone?: string;
	message?: string;
	className?: string;
}

export const WhatsAppButton = ({
	phone = DEFAULT_WHATSAPP_PHONE,
	message = DEFAULT_WHATSAPP_MESSAGE,
	className,
}: Props) => {
	return (
		<a
			href={buildWhatsAppUrl(phone, message)}
			target='_blank'
			rel='noopener noreferrer'
			aria-label='Contactar por WhatsApp'
			className={cn(
				'focus-ring fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-success-500 text-2xl text-white shadow-popover transition-transform hover:scale-105',
				className
			)}
		>
			<FaWhatsapp aria-hidden='true' />
		</a>
	);
};
