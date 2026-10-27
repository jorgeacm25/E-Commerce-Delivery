import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '../../ui';
import { useAdminProducts } from '../../../hooks';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (input: { productId: string; quantity: number; motive: string; customer?: string }) => void;
	isSubmitting: boolean;
	// Producto preseleccionado al abrir desde una fila del inventario.
	initialProductId?: string;
}

export const RegisterProductOutModal = ({ isOpen, onClose, onSubmit, isSubmitting, initialProductId }: Props) => {
	const { products } = useAdminProducts({ pageSize: 200 });

	const [productId, setProductId] = useState('');
	const [quantity, setQuantity] = useState('');
	const [motive, setMotive] = useState('');
	const [customer, setCustomer] = useState('');
	const [error, setError] = useState<string | undefined>();

	const reset = () => {
		setProductId('');
		setQuantity('');
		setMotive('');
		setCustomer('');
		setError(undefined);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	// Prefill al abrir desde una fila del inventario.
	useEffect(() => {
		if (!isOpen || !initialProductId) return;
		setProductId(initialProductId);
	}, [isOpen, initialProductId]);

	const handleSubmit = () => {
		const parsedQuantity = Number(quantity);
		if (!productId) {
			setError('Selecciona un producto');
			return;
		}
		if (!parsedQuantity || parsedQuantity <= 0) {
			setError('La cantidad debe ser mayor a 0');
			return;
		}
		if (!motive.trim()) {
			setError('Indica el motivo de la salida');
			return;
		}
		setError(undefined);
		onSubmit({ productId, quantity: parsedQuantity, motive: motive.trim(), customer: customer.trim() || undefined });
		reset();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Registrar salida de almacén'
			description='Descuenta stock por una salida que no corresponde a un pedido (merma, uso interno, etc.).'
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
					onChange={event => setProductId(event.target.value)}
					options={products.map(product => ({
						value: product.id,
						label: `${product.name} (stock: ${product.stock})`,
					}))}
				/>

				<Input
					label='Cantidad'
					type='number'
					min={1}
					required
					value={quantity}
					onChange={event => setQuantity(event.target.value)}
				/>

				<Input
					label='Motivo'
					required
					placeholder='Ej. merma, uso interno, ajuste de inventario'
					value={motive}
					onChange={event => setMotive(event.target.value)}
				/>

				<Input
					label='Cliente (opcional)'
					value={customer}
					onChange={event => setCustomer(event.target.value)}
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
