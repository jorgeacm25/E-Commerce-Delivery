import { useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Button, ConfirmDialog, DataTable, IconButton, PageHeader } from '../../../components/ui';
import { CategoryFormModal } from '../../../components/admin/categories/CategoryFormModal';
import { useAdminCategories, useManageCategories } from '../../../hooks';
import { AdminCategory, AdminCategoryInput } from '../../../interfaces';

export const AdminCategoriesPage = () => {
	const { categories, isLoading } = useAdminCategories();
	const { create, isCreating, update, isUpdating, remove } = useManageCategories();

	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<AdminCategory | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const openCreate = () => {
		setEditing(null);
		setModalOpen(true);
	};

	const openEdit = (category: AdminCategory) => {
		setEditing(category);
		setModalOpen(true);
	};

	const handleSubmit = (input: AdminCategoryInput) => {
		if (editing) {
			update({ id: editing.id, input }, { onSuccess: () => setModalOpen(false) });
		} else {
			create(input, { onSuccess: () => setModalOpen(false) });
		}
	};

	return (
		<div className='flex flex-col gap-4'>
			<PageHeader
				title='Categorías'
				description='Organiza el catálogo de productos por categoría.'
				actions={
					<Button leftIcon={<FiPlus />} onClick={openCreate}>
						Nueva categoría
					</Button>
				}
			/>

			<DataTable
				columns={[
					{ key: 'name', header: 'Nombre', render: category => category.name },
					{ key: 'slug', header: 'Slug', render: category => category.slug },
					{
						key: 'actions',
						header: '',
						className: 'text-right',
						render: category => (
							<div className='flex justify-end gap-1'>
								<IconButton
									icon={<FiEdit2 />}
									label='Editar'
									onClick={() => openEdit(category)}
								/>
								<IconButton
									icon={<FiTrash2 />}
									label='Eliminar'
									onClick={() => setDeletingId(category.id)}
								/>
							</div>
						),
					},
				]}
				data={categories}
				getRowId={category => category.id}
				isLoading={isLoading}
				emptyTitle='No hay categorías todavía'
				emptyDescription='Crea la primera categoría para empezar a organizar el catálogo.'
			/>

			<CategoryFormModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				editing={editing}
				onSubmit={handleSubmit}
				isSubmitting={isCreating || isUpdating}
			/>

			<ConfirmDialog
				isOpen={Boolean(deletingId)}
				onClose={() => setDeletingId(null)}
				onConfirm={() => {
					if (deletingId) remove(deletingId);
					setDeletingId(null);
				}}
				title='¿Eliminar esta categoría?'
				description='Esta acción no se puede deshacer. No podrás eliminar categorías que tengan productos.'
				confirmLabel='Eliminar'
				variant='danger'
			/>
		</div>
	);
};
