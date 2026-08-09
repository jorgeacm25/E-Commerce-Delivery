import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../../ui';
import { WorkerFormValues, workerFormSchema } from '../../../lib/adminWorkerValidators';

const emptyValues: WorkerFormValues = { fullName: '', role: 'Repartidor', pendingAmountUsd: 0 };

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: WorkerFormValues) => void;
	isSubmitting: boolean;
}

export const WorkerFormModal = ({ isOpen, onClose, onSubmit, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<WorkerFormValues>({ resolver: zodResolver(workerFormSchema), defaultValues: emptyValues });

	const handleClose = () => {
		reset(emptyValues);
		onClose();
	};

	const submit = (data: WorkerFormValues) => {
		onSubmit(data);
		reset(emptyValues);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Nuevo trabajador'
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
				<Input label='Nombre completo' required error={errors.fullName?.message} {...register('fullName')} />
				<Input label='Rol' required error={errors.role?.message} {...register('role')} />
				<Input
					label='Pago pendiente inicial (USD)'
					type='number'
					min={0}
					step='0.01'
					error={errors.pendingAmountUsd?.message}
					{...register('pendingAmountUsd')}
				/>
			</form>
		</Modal>
	);
};
