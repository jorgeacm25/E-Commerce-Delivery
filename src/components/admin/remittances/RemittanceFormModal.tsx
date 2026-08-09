import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, Textarea } from '../../ui';
import { RemittanceFormValues, remittanceFormSchema } from '../../../lib/adminRemittanceValidators';

const emptyValues: RemittanceFormValues = { recipientName: '', amountUsd: 0, amountCup: 0, notes: '' };

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: RemittanceFormValues) => void;
	isSubmitting: boolean;
}

export const RemittanceFormModal = ({ isOpen, onClose, onSubmit, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<RemittanceFormValues>({ resolver: zodResolver(remittanceFormSchema), defaultValues: emptyValues });

	const handleClose = () => {
		reset(emptyValues);
		onClose();
	};

	const submit = (data: RemittanceFormValues) => {
		onSubmit(data);
		reset(emptyValues);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Nueva remesa'
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
				<Input
					label='Destinatario'
					required
					error={errors.recipientName?.message}
					{...register('recipientName')}
				/>

				<div className='grid gap-4 sm:grid-cols-2'>
					<Input
						label='Monto (USD)'
						type='number'
						min={0}
						step='0.01'
						error={errors.amountUsd?.message}
						{...register('amountUsd')}
					/>
					<Input
						label='Monto (CUP)'
						type='number'
						min={0}
						step='0.01'
						error={errors.amountCup?.message}
						{...register('amountCup')}
					/>
				</div>

				<Textarea label='Notas' error={errors.notes?.message} {...register('notes')} />
			</form>
		</Modal>
	);
};
