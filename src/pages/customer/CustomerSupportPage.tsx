import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FiLifeBuoy } from 'react-icons/fi';
import { Badge, BadgeVariant, Button, EmptyState, Input, Select, Skeleton, Textarea } from '../../components/ui';
import { useAuth, useCreateSupportCase, useSupportCases } from '../../hooks';
import { SupportCaseStatus } from '../../interfaces';
import { SupportCaseFormValues, supportCaseFormSchema } from '../../lib/accountValidators';

const categoryOptions = [
	{ value: 'pedido', label: 'Pedido' },
	{ value: 'pago', label: 'Pago' },
	{ value: 'entrega', label: 'Entrega' },
	{ value: 'producto', label: 'Producto' },
	{ value: 'otro', label: 'Otro' },
];

const statusLabels: Record<SupportCaseStatus, string> = {
	abierto: 'Abierto',
	en_proceso: 'En proceso',
	resuelto: 'Resuelto',
	cerrado: 'Cerrado',
};

const statusVariants: Record<SupportCaseStatus, BadgeVariant> = {
	abierto: 'warning',
	en_proceso: 'primary',
	resuelto: 'success',
	cerrado: 'neutral',
};

const formatDate = (isoDate: string) =>
	new Date(isoDate).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });

export const CustomerSupportPage = () => {
	const { user } = useAuth();
	const { cases, isLoading } = useSupportCases(user?.id);
	const { mutate, isPending } = useCreateSupportCase(user?.id);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<SupportCaseFormValues>({ resolver: zodResolver(supportCaseFormSchema) });

	const onSubmit = (data: SupportCaseFormValues) => {
		mutate(
			{
				category: data.category,
				subject: data.subject,
				message: data.message,
				orderReference: data.orderReference || undefined,
			},
			{ onSuccess: () => reset() }
		);
	};

	return (
		<div className='flex flex-col gap-8'>
			<form onSubmit={handleSubmit(onSubmit)} className='flex max-w-lg flex-col gap-4'>
				<h2 className='text-sm font-semibold text-neutral-900'>Crear caso de soporte</h2>

				<Select
					label='Categoría'
					required
					placeholder='Selecciona una categoría'
					error={errors.category?.message}
					options={categoryOptions}
					{...register('category')}
				/>

				<Input label='Asunto' required error={errors.subject?.message} {...register('subject')} />

				<Input
					label='Número de pedido (opcional)'
					placeholder='Ej. DH-123456'
					error={errors.orderReference?.message}
					{...register('orderReference')}
				/>

				<Textarea label='Mensaje' required error={errors.message?.message} {...register('message')} />

				<Button type='submit' isLoading={isPending} className='self-start'>
					Crear caso
				</Button>
			</form>

			<div className='flex flex-col gap-3'>
				<h2 className='text-sm font-semibold text-neutral-900'>Mis casos</h2>

				{isLoading ? (
					<div className='flex flex-col gap-3'>
						<Skeleton className='h-16' />
						<Skeleton className='h-16' />
					</div>
				) : cases.length === 0 ? (
					<EmptyState icon={<FiLifeBuoy />} title='No tienes casos de soporte' description='Cuando crees uno, lo verás aquí.' />
				) : (
					<ul className='flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200'>
						{cases.map(supportCase => (
							<li key={supportCase.id} className='flex flex-col gap-1 p-4'>
								<div className='flex items-center justify-between gap-2'>
									<p className='text-sm font-medium text-neutral-900'>{supportCase.subject}</p>
									<Badge variant={statusVariants[supportCase.status]}>{statusLabels[supportCase.status]}</Badge>
								</div>
								<p className='text-xs text-neutral-500'>
									{formatDate(supportCase.createdAt)}
									{supportCase.orderReference ? ` · Pedido #${supportCase.orderReference}` : ''}
								</p>
								<p className='text-sm text-neutral-600'>{supportCase.message}</p>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};
