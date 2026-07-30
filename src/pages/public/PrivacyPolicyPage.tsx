import { PolicyPage } from './PolicyPage';

export const PrivacyPolicyPage = () => (
	<PolicyPage
		title='Política de privacidad'
		breadcrumb={[
			{ label: 'Inicio', href: '/' },
			{ label: 'Políticas', href: '/politicas/privacidad' },
			{ label: 'Privacidad' },
		]}
		paragraphs={[
			'Este texto es provisional. Aquí se detallará qué datos personales recopilamos, con qué finalidad y cómo los protegemos.',
			'La versión definitiva se redactará antes del lanzamiento a producción, en conjunto con el resto de las políticas del sitio.',
		]}
	/>
);
