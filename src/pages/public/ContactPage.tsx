import { useState } from 'react';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { Button, Input, PageHeader, Textarea, showInfoToast } from '../../components/ui';

export const ContactPage = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		showInfoToast('El envío de mensajes estará disponible próximamente.');
	};

	return (
		<div className='container flex flex-col gap-8 py-8'>
			<PageHeader
				title='Contacto'
				description='¿Tienes dudas sobre un pedido o un producto? Escríbenos.'
				breadcrumb={[{ label: 'Inicio', href: '/' }, { label: 'Contacto' }]}
			/>

			<div className='grid gap-8 lg:grid-cols-2'>
				<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
					<Input label='Nombre' required value={name} onChange={e => setName(e.target.value)} />
					<Input
						label='Correo electrónico'
						type='email'
						required
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>
					<Textarea
						label='Mensaje'
						required
						rows={5}
						value={message}
						onChange={e => setMessage(e.target.value)}
					/>
					<Button type='submit'>Enviar mensaje</Button>
				</form>

				<div className='flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-6'>
					<div className='flex items-start gap-3'>
						<FiMail className='mt-0.5 text-primary-600' aria-hidden='true' />
						<div>
							<p className='text-sm font-semibold text-neutral-900'>Correo</p>
							<p className='text-sm text-neutral-600'>contacto@deliveryhome.com</p>
						</div>
					</div>

					<div className='flex items-start gap-3'>
						<FiPhone className='mt-0.5 text-primary-600' aria-hidden='true' />
						<div>
							<p className='text-sm font-semibold text-neutral-900'>Teléfono / WhatsApp</p>
							<p className='text-sm text-neutral-600'>+53 5555 5555</p>
						</div>
					</div>

					<div className='flex items-start gap-3'>
						<FiMapPin className='mt-0.5 text-primary-600' aria-hidden='true' />
						<div>
							<p className='text-sm font-semibold text-neutral-900'>Cobertura</p>
							<p className='text-sm text-neutral-600'>Entregas a domicilio en toda Cuba.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
