import { useState } from 'react';
import { Control, FieldErrors, UseFormRegister, useFieldArray } from 'react-hook-form';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { Button, IconButton, Input, Select } from '../../ui';
import { ComboFormValues } from '../../../lib/adminComboValidators';
import { useProductsForComboSelector } from '../../../hooks';

interface Props {
	control: Control<ComboFormValues>;
	register: UseFormRegister<ComboFormValues>;
	errors: FieldErrors<ComboFormValues>;
}

export const ComboItemsFieldArray = ({ control, register, errors }: Props) => {
	const { products, isLoading } = useProductsForComboSelector();
	const { fields, append, remove } = useFieldArray({ control, name: 'products' });
	const [selectedProductId, setSelectedProductId] = useState('');

	const handleAdd = () => {
		if (!selectedProductId) return;
		if (fields.some(field => field.productId === selectedProductId)) return;

		append({ productId: selectedProductId, quantity: 1 });
		setSelectedProductId('');
	};

	return (
		<div className='flex flex-col gap-3'>
			<h3 className='text-sm font-semibold text-neutral-800'>Productos incluidos</h3>

			{errors.products?.message && (
				<p className='text-xs font-medium text-danger-600' role='alert'>
					{errors.products.message}
				</p>
			)}

			<div className='flex items-end gap-2'>
				<Select
					placeholder={isLoading ? 'Cargando...' : 'Selecciona un producto'}
					disabled={isLoading}
					value={selectedProductId}
					onChange={event => setSelectedProductId(event.target.value)}
					options={products.map(product => ({ value: product.id, label: product.name }))}
					containerClassName='flex-1'
				/>
				<Button type='button' variant='outline' leftIcon={<FiPlus />} onClick={handleAdd}>
					Agregar
				</Button>
			</div>

			{fields.length > 0 && (
				<ul className='flex flex-col gap-2'>
					{fields.map((field, index) => {
						const product = products.find(item => item.id === field.productId);

						return (
							<li
								key={field.id}
								className='flex items-center justify-between gap-3 rounded-lg bg-neutral-100 p-2'
							>
								<span className='text-sm text-neutral-800'>{product?.name ?? 'Producto'}</span>

								<div className='flex items-center gap-2'>
									<Input
										type='number'
										min={1}
										className='w-20'
										error={errors.products?.[index]?.quantity?.message}
										{...register(`products.${index}.quantity`)}
									/>
									<IconButton
										icon={<FiTrash2 />}
										label='Quitar del combo'
										variant='ghost'
										onClick={() => remove(index)}
									/>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};
