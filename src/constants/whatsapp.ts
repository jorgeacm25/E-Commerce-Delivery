// Valores por defecto del botón de WhatsApp. Ambos son configurables por props
// en <WhatsAppButton /> — reemplazar por los datos reales del negocio antes de producción.
export const DEFAULT_WHATSAPP_PHONE = '+53 5555 5555';
export const DEFAULT_WHATSAPP_MESSAGE =
	'Hola, quisiera más información sobre sus productos.';

export const buildWhatsAppUrl = (phone: string, message: string) => {
	const sanitizedPhone = phone.replace(/[^\d]/g, '');
	return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
};
