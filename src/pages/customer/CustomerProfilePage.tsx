import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Input, Skeleton } from '../../components/ui';
import { useAuth, useUpdateProfile } from '../../hooks';
import { ProfileFormValues, profileFormSchema } from '../../lib/accountValidators';

export const CustomerProfilePage = () => {
	const { user, profile, isProfileLoading } = useAuth();
	const { mutate, isPending } = useUpdateProfile(user?.id);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		values: profile ? { fullName: profile.fullName, phone: profile.phone ?? '' } : undefined,
	});

	const onSubmit = (data: ProfileFormValues) => {
		mutate({ fullName: data.fullName, phone: data.phone || undefined });
	};

	if (isProfileLoading || !profile) {
		return (
			<div className='flex max-w-md flex-col gap-4'>
				<Skeleton className='h-10' />
				<Skeleton className='h-10' />
				<Skeleton className='h-10 w-32' />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='flex max-w-md flex-col gap-4'>
			<Input label='Correo electrónico' value={user?.email ?? ''} disabled hint='No se puede modificar' />

			<Input label='Nombre completo' required error={errors.fullName?.message} {...register('fullName')} />

			<Input label='Teléfono' error={errors.phone?.message} {...register('phone')} />

			<Button type='submit' isLoading={isPending} className='self-start'>
				Guardar cambios
			</Button>
		</form>
	);
};
