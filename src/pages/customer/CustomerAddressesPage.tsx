import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FiHome, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import {
	Badge,
	Button,
	Checkbox,
	ConfirmDialog,
	EmptyState,
	IconButton,
	Input,
	Modal,
	Select,
	Skeleton,
} from '../../components/ui';
import { useAddresses, useAdminMunicipalities, useAdminProvinces, useAuth, useManageAddresses } from '../../hooks';
import { CustomerAddress } from '../../interfaces';
import { AddressFormValues, addressFormSchema } from '../../lib/accountValidators';

const emptyValues: AddressFormValues = {
	label: '',
	province: '',
	municipality: '',
	addressLine: '',
	referenceNotes: '',
	isDefault: false,
};

export const CustomerAddressesPage = () => {
	const { user } = useAuth();
	const { addresses, isLoading } = useAddresses(user?.id);
	const { create, isCreating, update, isUpdating, remove } = useManageAddresses(user?.id);
	const { provinces } = useAdminProvinces();
	const { municipalities } = useAdminMunicipalities();

	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<CustomerAddress | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<AddressFormValues>({ resolver: zodResolver(addressFormSchema), defaultValues: emptyValues });

	const selectedProvince = watch('province');
	const selectedProvinceEntity = provinces.find(province => province.name === selectedProvince);
	const municipalitiesInProvince = municipalities.filter(
		municipality => municipality.provinceId === selectedProvinceEntity?.id
	);

	const openCreate = () => {
		setEditing(null);
		reset(emptyValues);
		setModalOpen(true);
	};

	const openEdit = (address: CustomerAddress) => {
		setEditing(address);
		reset({
			label: address.label ?? '',
			province: address.province,
			municipality: address.municipality,
			addressLine: address.addressLine,
			referenceNotes: address.referenceNotes ?? '',
			isDefault: address.isDefault,
		});
		setModalOpen(true);
	};

	const onSubmit = (data: AddressFormValues) => {
		const input = {
			label: data.label || undefined,
			province: data.province,
			municipality: data.municipality,
			addressLine: data.addressLine,
			referenceNotes: data.referenceNotes || undefined,
			isDefault: data.isDefault,
		};

		if (editing) {
			update({ id: editing.id, input }, { onSuccess: () => setModalOpen(false) });
		} else {
			create(input, { onSuccess: () => setModalOpen(false) });
		}
	};

	if (isLoading) {
		return (
			<div className='flex flex-col gap-3'>
				<Skeleton className='h-24' />
				<Skeleton className='h-24' />
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex justify-end'>
				<Button leftIcon={<FiPlus />} onClick={openCreate}>
					Agregar dirección
				</Button>
			</div>

			{addresses.length === 0 ? (
				<EmptyState
					icon={<FiMapPin />}
					title='No tienes direcciones guardadas'
					description='Agrega una dirección para usarla más rápido en tus próximos pedidos.'
					action={
						<Button leftIcon={<FiPlus />} onClick={openCreate}>
							Agregar dirección
						</Button>
					}
				/>
			) : (
				<div className='grid gap-4 sm:grid-cols-2'>
					{addresses.map(address => (
						<div key={address.id} className='flex flex-col gap-2 rounded-2xl border border-neutral-200 p-4'>
							<div className='flex items-start justify-between gap-2'>
								<div className='flex items-center gap-2'>
									<FiHome className='text-neutral-400' aria-hidden='true' />
									<p className='font-semibold text-neutral-900'>{address.label || 'Dirección'}</p>
									{address.isDefault && <Badge variant='primary'>Predeterminada</Badge>}
								</div>
								<div className='flex gap-1'>
									<IconButton icon={<FiTrash2 />} label='Eliminar' variant='ghost' onClick={() => setDeletingId(address.id)} />
								</div>
							</div>
							<button type='button' onClick={() => openEdit(address)} className='focus-ring text-left'>
								<p className='text-sm text-neutral-700'>{address.addressLine}</p>
								<p className='text-xs text-neutral-500'>
									{address.municipality}, {address.province}
								</p>
								{address.referenceNotes && (
									<p className='text-xs text-neutral-500'>Ref: {address.referenceNotes}</p>
								)}
							</button>
						</div>
					))}
				</div>
			)}

			<Modal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				title={editing ? 'Editar dirección' : 'Nueva dirección'}
				footer={
					<>
						<Button variant='outline' onClick={() => setModalOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSubmit(onSubmit)} isLoading={isCreating || isUpdating}>
							Guardar
						</Button>
					</>
				}
			>
				<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
					<Input label='Etiqueta' placeholder='Ej. Casa, Trabajo' error={errors.label?.message} {...register('label')} />

					<Select
						label='Provincia'
						required
						placeholder='Selecciona una provincia'
						error={errors.province?.message}
						options={provinces.map(province => ({ value: province.name, label: province.name }))}
						{...register('province')}
					/>

					<Select
						label='Municipio'
						required
						placeholder={selectedProvinceEntity ? 'Selecciona un municipio' : 'Primero selecciona una provincia'}
						disabled={!selectedProvinceEntity}
						error={errors.municipality?.message}
						options={municipalitiesInProvince.map(m => ({ value: m.name, label: m.name }))}
						{...register('municipality')}
					/>

					<Input label='Dirección' required error={errors.addressLine?.message} {...register('addressLine')} />

					<Input label='Referencias' error={errors.referenceNotes?.message} {...register('referenceNotes')} />

					<Checkbox label='Marcar como predeterminada' {...register('isDefault')} />
				</form>
			</Modal>

			<ConfirmDialog
				isOpen={Boolean(deletingId)}
				onClose={() => setDeletingId(null)}
				onConfirm={() => {
					if (deletingId) remove(deletingId);
					setDeletingId(null);
				}}
				title='¿Eliminar esta dirección?'
				description='Esta acción no se puede deshacer.'
				confirmLabel='Eliminar'
				variant='danger'
			/>
		</div>
	);
};
