import { useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Badge, Button, ConfirmDialog, DataTable, Input, PageHeader, Skeleton } from '../../../components/ui';
import {
	useActiveAgencyContact,
	useActiveExchangeRate,
	useAdminAccounts,
	useAuth,
	useManageAdminAccounts,
	useUpdateAgencyContact,
	useUpdateExchangeRate,
} from '../../../hooks';
import { AdminAccountFormModal } from '../../../components/admin/accounts/AdminAccountFormModal';
import { AdminAccountResetPasswordModal } from '../../../components/admin/accounts/AdminAccountResetPasswordModal';
import { formatDateLong } from '../../../helpers';
import { AdminAccount } from '../../../interfaces';

export const AdminSettingsPage = () => {
	const { data: exchangeRate, isLoading } = useActiveExchangeRate();
	const { mutate: updateRate, isPending } = useUpdateExchangeRate();
	const { contact, isLoading: isLoadingContact } = useActiveAgencyContact();
	const { mutate: updateContact, isPending: isUpdatingContact } = useUpdateAgencyContact();
	const { profile } = useAuth();
	const isRootAdmin = profile?.accountType === 'admin';
	const { accounts, isLoading: isLoadingAccounts } = useAdminAccounts(isRootAdmin);
	const { create, isCreating, resetPassword, isResettingPassword, remove, isDeleting } = useManageAdminAccounts();

	const [newRate, setNewRate] = useState('');
	const [newWhatsapp, setNewWhatsapp] = useState('');
	const [accountModalOpen, setAccountModalOpen] = useState(false);
	const [resettingAccount, setResettingAccount] = useState<AdminAccount | null>(null);
	const [deletingAccount, setDeletingAccount] = useState<AdminAccount | null>(null);

	const handleSubmit = () => {
		const parsed = Number(newRate);
		if (!parsed || parsed <= 0) return;
		updateRate(parsed, { onSuccess: () => setNewRate('') });
	};

	const handleContactSubmit = () => {
		const trimmed = newWhatsapp.trim();
		if (!trimmed) return;
		updateContact(trimmed, { onSuccess: () => setNewWhatsapp('') });
	};

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader title='Configuración' description='Tasa de cambio y datos de contacto de la agencia.' />

			<div className='rounded-2xl border border-neutral-200 bg-white p-5 shadow-card'>
				<h2 className='mb-1 text-sm font-semibold text-neutral-900'>Tasa de cambio USD/CUP</h2>
				<div className='mb-4 text-sm text-neutral-500'>
					{isLoading
						? <Skeleton variant='text' className='w-64 max-w-full' />
						: exchangeRate
							? `Vigente: ${exchangeRate.valor_cup_por_usd} CUP por USD (desde ${formatDateLong(exchangeRate.vigente_desde)})`
							: 'No hay una tasa de cambio configurada todavía.'}
				</div>

				<div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
					<Input
						label='Nueva tasa (CUP por USD)'
						type='number'
						min={0}
						step='0.01'
						value={newRate}
						onChange={event => setNewRate(event.target.value)}
						containerClassName='sm:max-w-xs'
					/>
					<Button onClick={handleSubmit} isLoading={isPending} disabled={!newRate}>
						Actualizar tasa
					</Button>
				</div>
			</div>

			<div className='rounded-2xl border border-neutral-200 bg-white p-5 shadow-card'>
				<h2 className='mb-1 text-sm font-semibold text-neutral-900'>Datos de contacto</h2>
				<div className='mb-4 text-sm text-neutral-500'>
					{isLoadingContact
						? <Skeleton variant='text' className='w-64 max-w-full' />
						: contact
							? `Vigente: ${contact.whatsappPhone} (desde ${formatDateLong(contact.vigenteDesde)})`
							: 'No hay datos de contacto configurados todavía.'}
				</div>

				<div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
					<Input
						label='WhatsApp'
						placeholder='+53 5555 5555'
						value={newWhatsapp}
						onChange={event => setNewWhatsapp(event.target.value)}
						containerClassName='sm:max-w-xs'
					/>
					<Button onClick={handleContactSubmit} isLoading={isUpdatingContact} disabled={!newWhatsapp.trim()}>
						Actualizar
					</Button>
				</div>
			</div>

			{isRootAdmin && (
				<div className='rounded-2xl border border-neutral-200 bg-white p-5 shadow-card'>
					<div className='mb-4 flex items-center justify-between gap-3'>
						<div>
							<h2 className='text-sm font-semibold text-neutral-900'>Administradores y staff</h2>
							<p className='text-sm text-neutral-500'>
								Cuentas con acceso al panel. Solo un administrador raíz puede crear cuentas nuevas.
							</p>
						</div>
						<Button leftIcon={<FiPlus />} onClick={() => setAccountModalOpen(true)}>
							Nueva cuenta
						</Button>
					</div>

					<DataTable
						columns={[
							{ key: 'name', header: 'Nombre', render: account => account.fullName },
							{ key: 'userName', header: 'Usuario', render: account => account.userName },
							{
								key: 'accountType',
								header: 'Tipo',
								render: account => (
									<Badge variant={account.accountType === 'admin' ? 'primary' : 'neutral'}>
										{account.accountType === 'admin' ? 'Administrador' : 'Staff'}
									</Badge>
								),
							},
							{
								key: 'createdAt',
								header: 'Creada',
								render: account => (account.createdAt ? formatDateLong(account.createdAt) : '—'),
							},
							{
								key: 'actions',
								header: '',
								className: 'text-right',
								render: account => {
									const isSelf = account.id === profile?.id;
									return (
										<div className='flex justify-end gap-2'>
											<Button
												size='sm'
												variant='outline'
												leftIcon={<FiEdit2 />}
												disabled={isSelf}
												title={isSelf ? 'No puedes editar tu propia cuenta desde aquí' : undefined}
												onClick={() => setResettingAccount(account)}
											>
												Contraseña
											</Button>
											<Button
												size='sm'
												variant='outline'
												leftIcon={<FiTrash2 />}
												disabled={isSelf}
												title={isSelf ? 'No puedes eliminar tu propia cuenta' : undefined}
												onClick={() => setDeletingAccount(account)}
											>
												Eliminar
											</Button>
										</div>
									);
								},
							},
						]}
						data={accounts}
						getRowId={account => account.id}
						isLoading={isLoadingAccounts}
						emptyTitle='No hay cuentas todavía'
					/>
				</div>
			)}

			<AdminAccountFormModal
				isOpen={accountModalOpen}
				onClose={() => setAccountModalOpen(false)}
				isSubmitting={isCreating}
				onSubmit={values => create(values, { onSuccess: () => setAccountModalOpen(false) })}
			/>

			<AdminAccountResetPasswordModal
				isOpen={Boolean(resettingAccount)}
				accountName={resettingAccount?.fullName ?? ''}
				onClose={() => setResettingAccount(null)}
				isSubmitting={isResettingPassword}
				onSubmit={values => {
					if (!resettingAccount) return;
					resetPassword(
						{ id: resettingAccount.id, accountType: resettingAccount.accountType, password: values.password },
						{ onSuccess: () => setResettingAccount(null) }
					);
				}}
			/>

			<ConfirmDialog
				isOpen={Boolean(deletingAccount)}
				onClose={() => setDeletingAccount(null)}
				onConfirm={() => {
					if (deletingAccount) remove({ id: deletingAccount.id, accountType: deletingAccount.accountType });
					setDeletingAccount(null);
				}}
				title='¿Eliminar esta cuenta?'
				description='Se eliminará el acceso al panel de forma permanente. Esta acción no se puede deshacer.'
				confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
				variant='danger'
			/>
		</div>
	);
};
