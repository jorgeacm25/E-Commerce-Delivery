import { useState } from 'react';
import { Button, Input, Modal, Select } from '../../ui';
import { useAdminProducts } from '../../../hooks';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (input: { productId: string; quantity: number; provider: string; endDate?: string }) => void;
	isSubmitting: boolean;
}

export const RegisterProductInModal = ({ isOpen, onClose, onSubmit, isSubmitting }: Props) => {
	const { products } = useAdminProducts({ pageSize: 200 });

	const [productId, setProductId] = useState('');
	const [quantity, setQuantity] = useState('');
	const [provider, setProvider] = useState('');
	const [endDate, setEndDate] = useState('');
	const [error, setError] = useState<string | undefined>();

	const reset = () => {
		setProductId('');
		setQuantity('');
		setProvider('');
		setEndDate('');
		setError(undefined);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleProductChange = (value: string) => {
		setProductId(value);
		// Prefill del proveedor actual: la entrada se registra bajo un
		// proveedor (parte del mensaje que el backend escribe en el
		// histórico) y casi siempre es el mismo que el producto ya tiene.
		const product = products.find(item => item.id === value);
		setProvider(product?.provider ?? '');
	};

	const handleSubmit = () => {
		const parsedQuantity = Number(quantity);
		if (!productId) {
			setError('Selecciona un producto');
			return;
		}
		if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
			setError('La cantidad debe ser un número entero mayor a 0');
			return;
		}
		if (!provider.trim()) {
			setError('Indica el proveedor de la entrada');
			return;
		}
		setError(undefined);
		onSubmit({
			productId,
			quantity: parsedQuantity,
			provider: provider.trim(),
			endDate: endDate || undefined,
		});
		reset();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Registrar entrada de almacén'
			description='Suma stock por un reabastecimiento (compra a proveedor, devolución, etc.). El movimiento queda en el histórico como Entrada.'
			footer={
				<>
					<Button variant='outline' onClick={handleClose}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit} isLoading={isSubmitting}>
						Registrar
					</Button>
				</>
			}
		>
			<div className='flex flex-col gap-4'>
				<Select
					label='Producto'
					required
					placeholder='Selecciona un producto'
					value={productId}
					onChange={event => handleProductChange(event.target.value)}
					options={products.map(product => ({
						value: product.id,
						label: `${product.name} (stock actual: ${product.stock} ${product.unit})`,
					}))}
				/>

				<Input
					label='Cantidad a ingresar'
					type='number'
					min={1}
					step={1}
					required
					placeholder='Ej. 20'
					value={quantity}
					onChange={event => setQuantity(event.target.value)}
				/>

				<Input
					label='Proveedor'
					required
					placeholder='Ej. Alimport'
					value={provider}
					onChange={event => setProvider(event.target.value)}
				/>

				<Input
					label='Vencimiento del nuevo lote (opcional)'
					type='date'
					hint='Rellénalo si este reabastecimiento es un lote con vencimiento nuevo.'
					value={endDate}
					onChange={event => setEndDate(event.target.value)}
				/>

				{error && (
					<p className='text-xs font-medium text-danger-600' role='alert'>
						{error}
					</p>
				)}
			</div>
		</Modal>
	);
};
