import { useState } from 'react';
import {
	useCreateCombo,
	useVariantsForComboSelector,
} from '../../../hooks';
import { generateSlug } from '../../../helpers';
import { ComboItemInput } from '../../../interfaces';
import { ImSpinner2 } from 'react-icons/im';
import { FiTrash2 } from 'react-icons/fi';

export const FormCombo = () => {
	const { data: products, isLoading: isLoadingVariants } =
		useVariantsForComboSelector();
	const { mutate, isPending } = useCreateCombo();

	const [nombre, setNombre] = useState('');
	const [descripcion, setDescripcion] = useState('');
	const [precio, setPrecio] = useState('');
	const [items, setItems] = useState<ComboItemInput[]>([]);
	const [selectedVariantId, setSelectedVariantId] = useState('');

	const allVariants =
		products?.flatMap(
			p =>
				p.variants?.map(v => ({
					...v,
					productName: p.name,
				})) ?? []
		) ?? [];

	const handleAddItem = () => {
		if (!selectedVariantId) return;
		if (items.some(i => i.variantId === selectedVariantId)) return;

		setItems([...items, { variantId: selectedVariantId, cantidad: 1 }]);
		setSelectedVariantId('');
	};

	const handleRemoveItem = (variantId: string) => {
		setItems(items.filter(i => i.variantId !== variantId));
	};

	const handleQuantityChange = (variantId: string, cantidad: number) => {
		setItems(
			items.map(i =>
				i.variantId === variantId ? { ...i, cantidad } : i
			)
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!nombre || !precio || items.length === 0) return;

		mutate(
			{
				nombre,
				slug: generateSlug(nombre),
				descripcion: descripcion || undefined,
				precioComboUsd: Number(precio),
				items,
			},
			{
				onSuccess: () => {
					setNombre('');
					setDescripcion('');
					setPrecio('');
					setItems([]);
				},
			}
		);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='border border-slate-200 rounded-md p-5 space-y-4'
		>
			<h3 className='font-semibold'>Nuevo combo</h3>

			<div className='grid gap-3 md:grid-cols-2'>
				<input
					type='text'
					placeholder='Nombre del combo'
					value={nombre}
					onChange={e => setNombre(e.target.value)}
					className='border border-slate-200 rounded-md p-2 text-sm'
				/>

				<input
					type='number'
					step='0.01'
					placeholder='Precio del combo (USD)'
					value={precio}
					onChange={e => setPrecio(e.target.value)}
					className='border border-slate-200 rounded-md p-2 text-sm'
				/>
			</div>

			<textarea
				placeholder='Descripción (opcional)'
				value={descripcion}
				onChange={e => setDescripcion(e.target.value)}
				className='border border-slate-200 rounded-md p-2 text-sm w-full'
			/>

			<div className='space-y-2'>
				<p className='text-sm font-medium'>Productos incluidos</p>

				<div className='flex gap-2'>
					<select
						value={selectedVariantId}
						onChange={e => setSelectedVariantId(e.target.value)}
						disabled={isLoadingVariants}
						className='border border-slate-200 rounded-md p-2 text-sm flex-1'
					>
						<option value=''>Selecciona una variante...</option>
						{allVariants.map(v => (
							<option key={v.id} value={v.id}>
								{v.productName} — {v.color_name} /{' '}
								{v.storage}
							</option>
						))}
					</select>

					<button
						type='button'
						onClick={handleAddItem}
						className='bg-stone-200 text-sm font-semibold px-4 rounded-md'
					>
						Agregar
					</button>
				</div>

				{items.length > 0 && (
					<ul className='space-y-2'>
						{items.map(item => {
							const variant = allVariants.find(
								v => v.id === item.variantId
							);
							return (
								<li
									key={item.variantId}
									className='flex items-center justify-between text-sm bg-stone-100 rounded-md p-2'
								>
									<span>
										{variant?.productName} —{' '}
										{variant?.color_name} /{' '}
										{variant?.storage}
									</span>

									<div className='flex items-center gap-2'>
										<input
											type='number'
											min={1}
											value={item.cantidad}
											onChange={e =>
												handleQuantityChange(
													item.variantId,
													Number(e.target.value)
												)
											}
											className='w-16 border border-slate-200 rounded-md p-1 text-center'
										/>
										<button
											type='button'
											onClick={() =>
												handleRemoveItem(
													item.variantId
												)
											}
											className='text-red-500'
										>
											<FiTrash2 />
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<button
				type='submit'
				disabled={isPending}
				className='bg-black text-white py-3 px-5 text-sm font-semibold rounded-md disabled:opacity-40 flex items-center gap-2'
			>
				{isPending && <ImSpinner2 className='animate-spin' size={16} />}
				Crear combo
			</button>
		</form>
	);
};
