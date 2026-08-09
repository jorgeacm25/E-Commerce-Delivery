import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FiZap } from 'react-icons/fi';
import { Button, IconButton, Input, Modal } from '../../ui';
import { AdminCategory, AdminCategoryInput } from '../../../interfaces';
import { CategoryFormValues, categoryFormSchema } from '../../../lib/adminCategoryValidators';
import { generateSlug } from '../../../helpers';

const emptyValues: CategoryFormValues = {
	name: '',
	slug: '',
};

interface Props {
	isOpen: boolean;
	onClose: () => void;
	editing: AdminCategory | null;
	onSubmit: (input: AdminCategoryInput) => void;
	isSubmitting: boolean;
}

export const CategoryFormModal = ({ isOpen, onClose, editing, onSubmit, isSubmitting }: Props) => {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CategoryFormValues>({
		resolver: zodResolver(categoryFormSchema),
		defaultValues: editing
			? {
					name: editing.name,
					slug: editing.slug,
			  }
			: emptyValues,
	});

	const name = watch('name');

	const submit = (data: CategoryFormValues) => {
		onSubmit({
			name: data.name,
			slug: data.slug,
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={editing ? 'Editar categoría' : 'Nueva categoría'}
			footer={
				<>
					<Button variant='outline' onClick={onClose}>
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

				<div className='flex items-end gap-2'>
					<Input
						label='Slug'
						required
						hint='Se usa en la URL, ej. carnes-rojas'
						error={errors.slug?.message}
						containerClassName='flex-1'
						{...register('slug')}
					/>
					<IconButton
						icon={<FiZap />}
						label='Generar slug desde el nombre'
						variant='outline'
						onClick={() => setValue('slug', generateSlug(name || ''))}
					/>
				</div>
			</form>
		</Modal>
	);
};
