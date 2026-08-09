import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, Switch } from '../../ui';
import { ComboFormValues, comboFormSchema } from '../../../lib/adminComboValidators';
import { ComboItemsFieldArray } from './ComboItemsFieldArray';
import { AdminCombo } from '../../../interfaces';
import { formatPrice } from '../../../helpers';

const emptyValues: ComboFormValues = {
	name: '',
	priceUsd: 0,
	hasDiscount: false,
	discountPriceUsd: undefined,
	products: [],
};

const valuesFromCombo = (combo: AdminCombo): ComboFormValues => ({
	name: combo.name,
	priceUsd: combo.priceUsd,
	hasDiscount: combo.discountPriceUsd != null,
	discountPriceUsd: combo.discountPriceUsd ?? undefined,
	products: combo.products.map(product => ({ productId: product.id, quantity: product.quantity })),
});

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: ComboFormValues) => void;
	isSubmitting: boolean;
	// Si se pasa, el modal edita ese combo en vez de crear uno nuevo.
	combo?: AdminCombo | null;
}

export const AdminComboFormModal = ({ isOpen, onClose, onSubmit, isSubmitting, combo }: Props) => {
	const {
		register,
		handleSubmit,
		reset,
		control,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ComboFormValues>({ resolver: zodResolver(comboFormSchema), defaultValues: emptyValues });

	const hasDiscount = watch('hasDiscount');
	const priceUsd = watch('priceUsd');

	useEffect(() => {
		if (isOpen) reset(combo ? valuesFromCombo(combo) : emptyValues);
	}, [isOpen, combo, reset]);

	const handleClose = () => {
		reset(emptyValues);
		onClose();
	};

	const submit = (data: ComboFormValues) => {
		onSubmit(data);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={combo ? 'Editar combo' : 'Nuevo combo'}
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
				<Input label='Nombre' required error={errors.name?.message} {...register('name')} />
				<Input
					label='Precio del combo (USD)'
					type='number'
					step='0.01'
					min={0}
					required
					error={errors.priceUsd?.message}
					{...register('priceUsd')}
				/>

				<Switch
					label='Aplicar descuento'
					checked={hasDiscount}
					onChange={checked => setValue('hasDiscount', checked, { shouldValidate: true })}
				/>

				{hasDiscount && (
					<Input
						label='Precio con descuento (USD)'
						type='number'
						step='0.01'
						min={0}
						hint={priceUsd ? `Precio original: ${formatPrice(priceUsd)}` : undefined}
						error={errors.discountPriceUsd?.message}
						{...register('discountPriceUsd')}
					/>
				)}

				<ComboItemsFieldArray control={control} register={register} errors={errors} />
			</form>
		</Modal>
	);
};
