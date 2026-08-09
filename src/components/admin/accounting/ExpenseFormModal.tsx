import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../../ui';
import { ExpenseFormValues, expenseFormSchema } from '../../../lib/adminExpenseValidators';

const today = new Date().toISOString().slice(0, 10);

const emptyValues: ExpenseFormValues = {
	description: '',
	amountUsd: 0,
	amountCup: 0,
	category: '',
	date: today,
};

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: ExpenseFormValues) => void;
	isSubmitting: boolean;
	initialValues?: ExpenseFormValues;
}

export const ExpenseFormModal = ({ isOpen, onClose, onSubmit, isSubmitting, initialValues }: Props) => {
	const isEditing = Boolean(initialValues);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ExpenseFormValues>({
		resolver: zodResolver(expenseFormSchema),
		defaultValues: initialValues ?? emptyValues,
	});

	useEffect(() => {
		if (isOpen) reset(initialValues ?? emptyValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, initialValues]);

	const handleClose = () => {
		reset(emptyValues);
		onClose();
	};

	const submit = (data: ExpenseFormValues) => {
		onSubmit(data);
		if (!isEditing) reset(emptyValues);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={isEditing ? 'Editar gasto' : 'Registrar gasto'}
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
				<Input label='Descripción' required error={errors.description?.message} {...register('description')} />
				<Input label='Categoría' required placeholder='Ej. logística, alquiler' error={errors.category?.message} {...register('category')} />

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

				<Input label='Fecha' type='date' required error={errors.date?.message} {...register('date')} />
			</form>
		</Modal>
	);
};
