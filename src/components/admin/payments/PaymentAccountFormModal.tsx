import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, Select } from '../../ui';
import { PaymentAccountFormValues, paymentAccountFormSchema } from '../../../lib/paymentAccountValidators';

const emptyValues: PaymentAccountFormValues = {
	tipo: 'zelle',
	titular: '',
	referencia: '',
	prioridad: 0,
};

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: PaymentAccountFormValues) => void;
	isSubmitting: boolean;
}

// Solo Create usa `tipo` — el backend no lo acepta en Update, así que este
// modal es exclusivo para "nueva cuenta" (editar titular/referencia/
// prioridad se hace inline en la tabla).
export const PaymentAccountFormModal = ({ isOpen, onClose, onSubmit, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PaymentAccountFormValues>({
		resolver: zodResolver(paymentAccountFormSchema),
		defaultValues: emptyValues,
	});

	const handleClose = () => {
		reset(emptyValues);
		onClose();
	};

	const submit = (data: PaymentAccountFormValues) => {
		onSubmit(data);
		reset(emptyValues);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Nueva cuenta de cobro'
			footer={
				<>
					<Button variant='outline' onClick={handleClose}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit(submit)} isLoading={isSubmitting}>
						Guardar
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit(submit)} className='flex flex-col gap-4'>
				<Select
					label='Tipo'
					required
					options={[
						{ value: 'zelle', label: 'Zelle' },
						{ value: 'paypal', label: 'PayPal' },
					]}
					error={errors.tipo?.message}
					{...register('tipo')}
				/>

				<Input label='Titular' required error={errors.titular?.message} {...register('titular')} />

				<Input
					label='Referencia'
					required
					hint='Correo o número de cuenta que verá el cliente'
					error={errors.referencia?.message}
					{...register('referencia')}
				/>

				<Input
					label='Prioridad'
					type='number'
					min={0}
					hint='Menor número aparece primero en el checkout'
					error={errors.prioridad?.message}
					{...register('prioridad')}
				/>
			</form>
		</Modal>
	);
};
