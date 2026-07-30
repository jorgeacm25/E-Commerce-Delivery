import { PolicyPage } from './PolicyPage';

export const ShippingPolicyPage = () => (
	<PolicyPage
		title='Política de entrega'
		breadcrumb={[
			{ label: 'Inicio', href: '/' },
			{ label: 'Políticas', href: '/politicas/entrega' },
			{ label: 'Entrega' },
		]}
		paragraphs={[
			'Este texto es provisional. Aquí se detallarán los tiempos, zonas de cobertura y condiciones de entrega en Cuba.',
			'La versión definitiva se redactará antes del lanzamiento a producción.',
		]}
	/>
);
