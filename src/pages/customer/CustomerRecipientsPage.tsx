import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';
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
import { useAuth, useDeliveryZones, useManageRecipients, useRecipients } from '../../hooks';
import { CustomerRecipient } from '../../interfaces';
import { RecipientFormValues, recipientFormSchema } from '../../lib/accountValidators';

const emptyValues: RecipientFormValues = {
	fullName: '',
	phone: '',
	nationalId: '',
	province: '',
	municipality: '',
	addressLine: '',
	notes: '',
	isDefault: false,
};

export const CustomerRecipientsPage = () => {
	const { user } = useAuth();
	const { recipients, isLoading } = useRecipients(user?.id);
	const { create, isCreating, update, isUpdating, remove } = useManageRecipients(user?.id);
	const { zones } = useDeliveryZones();

	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<CustomerRecipient | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<RecipientFormValues>({ resolver: zodResolver(recipientFormSchema), defaultValues: emptyValues });

	const selectedProvince = watch('province');
	const selectedZone = zones.find(zone => zone.province === selectedProvince);

	const openCreate = () => {
		setEditing(null);
		reset(emptyValues);
		setModalOpen(true);
	};

	const openEdit = (recipient: CustomerRecipient) => {
		setEditing(recipient);
		reset({
			fullName: recipient.fullName,
			phone: recipient.phone,
			nationalId: recipient.nationalId ?? '',
			province: recipient.province,
			municipality: recipient.municipality,
			addressLine: recipient.addressLine,
			notes: recipient.notes ?? '',
			isDefault: recipient.isDefault,
		});
		setModalOpen(true);
	};

	const onSubmit = (data: RecipientFormValues) => {
		const input = {
			fullName: data.fullName,
			phone: data.phone,
			nationalId: data.nationalId || undefined,
			province: data.province,
			municipality: data.municipality,
			addressLine: data.addressLine,
			notes: data.notes || undefined,
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
					Agregar destinatario
				</Button>
			</div>

			{recipients.length === 0 ? (
				<EmptyState
					icon={<FiUsers />}
					title='No tienes destinatarios guardados'
					description='Agrega a las personas a las que sueles enviar pedidos en Cuba.'
					action={
						<Button leftIcon={<FiPlus />} onClick={openCreate}>
							Agregar destinatario
						</Button>
					}
				/>
			) : (
				<div className='grid gap-4 sm:grid-cols-2'>
					{recipients.map(recipient => (
						<div key={recipient.id} className='flex flex-col gap-2 rounded-2xl border border-neutral-200 p-4'>
							<div className='flex items-start justify-between gap-2'>
								<div className='flex items-center gap-2'>
									<p className='font-semibold text-neutral-900'>{recipient.fullName}</p>
									{recipient.isDefault && <Badge variant='primary'>Predeterminado</Badge>}
								</div>
								<IconButton icon={<FiTrash2 />} label='Eliminar' variant='ghost' onClick={() => setDeletingId(recipient.id)} />
							</div>
							<button type='button' onClick={() => openEdit(recipient)} className='focus-ring text-left'>
								<p className='text-sm text-neutral-700'>{recipient.phone}</p>
								<p className='text-sm text-neutral-700'>{recipient.addressLine}</p>
								<p className='text-xs text-neutral-500'>
									{recipient.municipality}, {recipient.province}
								</p>
							</button>
						</div>
					))}
				</div>
			)}

			<Modal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				title={editing ? 'Editar destinatario' : 'Nuevo destinatario'}
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
					<Input label='Nombre completo' required error={errors.fullName?.message} {...register('fullName')} />

					<Input label='Teléfono' required error={errors.phone?.message} {...register('phone')} />

					<Input label='Carné de identidad' error={errors.nationalId?.message} {...register('nationalId')} />

					<Select
						label='Provincia'
						required
						placeholder='Selecciona una provincia'
						error={errors.province?.message}
						options={zones.map(zone => ({ value: zone.province, label: zone.province, disabled: !zone.available }))}
						{...register('province')}
					/>

					<Select
						label='Municipio'
						required
						placeholder={selectedZone ? 'Selecciona un municipio' : 'Primero selecciona una provincia'}
						disabled={!selectedZone}
						error={errors.municipality?.message}
						options={(selectedZone?.municipalities ?? []).map(m => ({ value: m, label: m }))}
						{...register('municipality')}
					/>

					<Input label='Dirección' required error={errors.addressLine?.message} {...register('addressLine')} />

					<Input label='Notas' error={errors.notes?.message} {...register('notes')} />

					<Checkbox label='Marcar como predeterminado' {...register('isDefault')} />
				</form>
			</Modal>

			<ConfirmDialog
				isOpen={Boolean(deletingId)}
				onClose={() => setDeletingId(null)}
				onConfirm={() => {
					if (deletingId) remove(deletingId);
					setDeletingId(null);
				}}
				title='¿Eliminar este destinatario?'
				description='Esta acción no se puede deshacer.'
				confirmLabel='Eliminar'
				variant='danger'
			/>
		</div>
	);
};
