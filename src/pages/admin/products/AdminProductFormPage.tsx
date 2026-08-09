import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert, Button, Input, PageHeader, Select, Skeleton } from '../../../components/ui';
import { ProductImagesUploader } from '../../../components/admin/products/ProductImagesUploader';
import { PricingModeFields } from '../../../components/admin/products/PricingModeFields';
import { useAdminCategories, useAdminProduct, useManageProducts } from '../../../hooks';
import { ProductFormValues, productFormSchema } from '../../../lib/adminProductValidators';

const toDateInputValue = (isoDate: string | undefined) => (isoDate ? isoDate.slice(0, 10) : '');

const emptyValues: ProductFormValues = {
	categoryId: '',
	name: '',
	unit: 'unidad',
	provider: '',
	endDate: '',
	pricingMode: 'fixed',
	priceUsd: 0,
	costCup: undefined,
	marginUsd: undefined,
	stock: 0,
	hasDiscount: false,
	discountPriceUsd: undefined,
};

export const AdminProductFormPage = () => {
	const { id } = useParams<{ id: string }>();
	const isEditing = Boolean(id);
	const navigate = useNavigate();

	const { categories, isLoading: isLoadingCategories } = useAdminCategories();
	const { product, isLoading: isLoadingProduct } = useAdminProduct(id);
	const { create, isCreating, update, isUpdating } = useManageProducts();

	const [images, setImages] = useState<(File | string)[]>([]);
	const [imagesError, setImagesError] = useState<string | undefined>();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<ProductFormValues>({
		resolver: zodResolver(productFormSchema),
		defaultValues: emptyValues,
	});

	useEffect(() => {
		if (!product) return;

		reset({
			categoryId: product.categoryId,
			name: product.name,
			unit: product.unit,
			provider: product.provider,
			endDate: toDateInputValue(product.endDate),
			pricingMode: 'fixed',
			priceUsd: product.priceUsd,
			costCup: undefined,
			marginUsd: undefined,
			stock: product.stock,
			hasDiscount: product.discountPriceUsd != null,
			discountPriceUsd: product.discountPriceUsd ?? undefined,
		});
		setImages(product.images);
	}, [product, reset]);

	const onSubmit = (data: ProductFormValues) => {
		if (images.length === 0) {
			setImagesError('Agrega al menos una imagen del producto');
			return;
		}
		setImagesError(undefined);

		const input = {
			categoryId: data.categoryId,
			name: data.name,
			unit: data.unit,
			provider: data.provider,
			endDate: data.endDate,
			priceUsd: data.priceUsd,
			discountPriceUsd: data.hasDiscount ? (data.discountPriceUsd ?? null) : null,
			stock: data.stock,
			images,
		};

		if (isEditing && id && product) {
			update(
				{ id, input, currentImages: product.images, currentEndDate: toDateInputValue(product.endDate) },
				{ onSuccess: () => navigate('/admin/productos') }
			);
		} else {
			create(input, { onSuccess: () => navigate('/admin/productos') });
		}
	};

	if (isEditing && isLoadingProduct) {
		return (
			<div className='flex flex-col gap-4'>
				<Skeleton className='h-8 w-48' />
				<Skeleton className='h-64' />
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title={isEditing ? 'Editar producto' : 'Nuevo producto'}
				breadcrumb={[
					{ label: 'Productos', href: '/admin/productos' },
					{ label: isEditing ? 'Editar' : 'Nuevo' },
				]}
			/>

			{isEditing && (
				<Alert variant='info'>
					El nombre y la unidad no se pueden cambiar una vez creado el producto. Editar el stock y
					guardar registra un reabastecimiento en el histórico de almacén.
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Input
						label='Nombre'
						required
						disabled={isEditing}
						error={errors.name?.message}
						{...register('name')}
					/>

					<Select
						label='Categoría'
						required
						placeholder={isLoadingCategories ? 'Cargando...' : 'Selecciona una categoría'}
						disabled={isLoadingCategories}
						error={errors.categoryId?.message}
						options={categories.map(category => ({ value: category.id, label: category.name }))}
						{...register('categoryId')}
					/>

					<Input
						label='Unidad'
						required
						disabled={isEditing}
						placeholder='Ej. unidad, lb, caja'
						error={errors.unit?.message}
						{...register('unit')}
					/>

					<Input label='Proveedor' required error={errors.provider?.message} {...register('provider')} />

					<Input
						label='Stock'
						type='number'
						min={0}
						required
						hint={isEditing ? 'Cantidad total tras este reabastecimiento' : undefined}
						error={errors.stock?.message}
						{...register('stock')}
					/>

					<Input
						label='Vencimiento'
						type='date'
						required
						hint={isEditing ? 'Cambiar la fecha registra un lote nuevo' : undefined}
						error={errors.endDate?.message}
						{...register('endDate')}
					/>
				</div>

				<PricingModeFields register={register} watch={watch} setValue={setValue} errors={errors} />

				<ProductImagesUploader images={images} onChange={setImages} error={imagesError} />

				<div className='flex justify-end gap-2'>
					<Button type='button' variant='outline' onClick={() => navigate('/admin/productos')}>
						Cancelar
					</Button>
					<Button type='submit' isLoading={isCreating || isUpdating}>
						Guardar
					</Button>
				</div>
			</form>
		</div>
	);
};
