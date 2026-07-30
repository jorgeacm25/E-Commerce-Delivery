import { PolicyPage } from './PolicyPage';

export const TermsPage = () => (
	<PolicyPage
		title='Términos y condiciones'
		breadcrumb={[
			{ label: 'Inicio', href: '/' },
			{ label: 'Políticas', href: '/politicas/terminos' },
			{ label: 'Términos' },
		]}
		paragraphs={[
			'Este texto es provisional. Aquí se detallarán las condiciones de uso de la plataforma y de compra de productos.',
			'La versión definitiva se redactará antes del lanzamiento a producción.',
		]}
	/>
);
