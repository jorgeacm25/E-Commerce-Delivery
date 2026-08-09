import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Alert, Badge, Button, DataTable, Input, PageHeader } from '../../../components/ui';
import {
	useActiveExchangeRate,
	useAdminAccounts,
	useAuth,
	useManageAdminAccounts,
	useUpdateExchangeRate,
} from '../../../hooks';
import { AdminAccountFormModal } from '../../../components/admin/accounts/AdminAccountFormModal';
import { DEFAULT_WHATSAPP_PHONE } from '../../../constants/whatsapp';
import { formatDateLong } from '../../../helpers';

export const AdminSettingsPage = () => {
	const { data: exchangeRate, isLoading } = useActiveExchangeRate();
	const { mutate: updateRate, isPending } = useUpdateExchangeRate();
	const { profile } = useAuth();
	const isRootAdmin = profile?.accountType === 'admin';
	const { accounts, isLoading: isLoadingAccounts } = useAdminAccounts(isRootAdmin);
	const { create, isCreating } = useManageAdminAccounts();

	const [newRate, setNewRate] = useState('');
	const [accountModalOpen, setAccountModalOpen] = useState(false);

	const handleSubmit = () => {
		const parsed = Number(newRate);
		if (!parsed || parsed <= 0) return;
		updateRate(parsed, { onSuccess: () => setNewRate('') });
	};

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader title='Configuración' description='Tasa de cambio y datos de contacto de la agencia.' />

			<div className='rounded-2xl border border-neutral-200 bg-white p-5 shadow-card'>
				<h2 className='mb-1 text-sm font-semibold text-neutral-900'>Tasa de cambio USD/CUP</h2>
				<p className='mb-4 text-sm text-neutral-500'>
					{isLoading
						? 'Cargando...'
						: exchangeRate
							? `Vigente: ${exchangeRate.valor_cup_por_usd} CUP por USD (desde ${formatDateLong(exchangeRate.vigente_desde)})`
							: 'No hay una tasa de cambio configurada todavía.'}
				</p>

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
				<p className='mb-4 text-sm text-neutral-500'>
					Información que ve el cliente en la tienda pública (footer, botón de WhatsApp).
				</p>

				<Alert variant='info' className='mb-4'>
					Estos datos todavía viven en el código (no hay una tabla propia) — editar aquí llega en una
					fase futura. Por ahora se muestran solo de referencia.
				</Alert>

				<Input label='WhatsApp' value={DEFAULT_WHATSAPP_PHONE} disabled containerClassName='sm:max-w-xs' />
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
		</div>
	);
};
