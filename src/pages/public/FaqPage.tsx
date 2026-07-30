import { PageHeader } from '../../components/ui';

const faqs = [
	{
		question: '¿Cómo funciona la entrega en Cuba?',
		answer:
			'Compras desde el exterior y coordinamos la entrega directa al destinatario en Cuba, sin que tenga que hacer trámites.',
	},
	{
		question: '¿Qué métodos de pago aceptan?',
		answer:
			'Zelle y PayPal por ahora. Subes el comprobante de pago y lo verificamos manualmente antes de procesar el pedido.',
	},
	{
		question: '¿En qué moneda se muestran los precios?',
		answer: 'Todos los precios de la tienda se muestran únicamente en dólares (USD).',
	},
	{
		question: '¿Puedo rastrear mi pedido?',
		answer: 'Sí, desde la sección "Rastrear pedido" con tu número de pedido.',
	},
];

export const FaqPage = () => {
	return (
		<div className='container flex flex-col gap-8 py-8'>
			<PageHeader
				title='Preguntas frecuentes'
				description='Resolvemos las dudas más comunes sobre pedidos y entregas.'
				breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Preguntas frecuentes' }]}
			/>

			<div className='flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white'>
				{faqs.map(faq => (
					<details key={faq.question} className='group p-5'>
						<summary className='cursor-pointer list-none text-sm font-semibold text-neutral-900 marker:content-none'>
							{faq.question}
						</summary>
						<p className='mt-2 text-sm text-neutral-600'>{faq.answer}</p>
					</details>
				))}
			</div>
		</div>
	);
};
