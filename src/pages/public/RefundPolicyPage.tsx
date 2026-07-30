import { PolicyPage } from './PolicyPage';

export const RefundPolicyPage = () => (
	<PolicyPage
		title='Política de reembolsos'
		breadcrumb={[
			{ label: 'Inicio', href: '/' },
			{ label: 'Políticas', href: '/politicas/reembolsos' },
			{ label: 'Reembolsos' },
		]}
		paragraphs={[
			'Este texto es provisional. Aquí se detallarán los casos en los que aplica reembolso y el proceso para solicitarlo.',
			'La versión definitiva se redactará antes del lanzamiento a producción.',
		]}
	/>
);
