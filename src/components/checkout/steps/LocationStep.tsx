import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useAdminMunicipalities, useAdminProvinces } from '../../../hooks';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { SectionState } from '../../home/SectionState';
import { Select, Skeleton } from '../../ui';

// Provincia y municipio de entrega, contra las zonas reales del backend
// .NET (api/province, api/municipality — las mismas que administra
// /admin/zonas-entrega). Geografía fija: hoy solo hay cobertura en Pinar
// del Río, Artemisa y La Habana (ver DbSeeder del backend).
export const LocationStep = () => {
	const {
		register,
		control,
		setValue,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	const { provinces, isLoading: isLoadingProvinces, isError: isProvincesError } = useAdminProvinces();
	const { municipalities, isLoading: isLoadingMunicipalities, isError: isMunicipalitiesError } =
		useAdminMunicipalities();

	const isLoading = isLoadingProvinces || isLoadingMunicipalities;
	const isError = isProvincesError || isMunicipalitiesError;

	const provinceId = useWatch({ control, name: 'location.provinceId' });
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		setValue('location.municipality', '', { shouldValidate: false });
	}, [provinceId, setValue]);

	const municipalitiesInProvince = municipalities.filter(municipality => municipality.provinceId === provinceId);

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>Provincia y municipio donde vive el destinatario.</p>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={!isLoading && !isError && provinces.length === 0}
				loadingFallback={
					<div className='flex flex-col gap-4'>
						<Skeleton className='h-16 rounded-lg' />
						<Skeleton className='h-16 rounded-lg' />
					</div>
				}
				emptyTitle='No hay zonas de entrega disponibles'
			>
				<Select
					label='Provincia'
					required
					placeholder='Selecciona una provincia'
					error={errors.location?.provinceId?.message}
					options={provinces.map(province => ({ value: province.id, label: province.name }))}
					{...register('location.provinceId')}
				/>

				<Select
					label='Municipio'
					required
					placeholder={provinceId ? 'Selecciona un municipio' : 'Primero selecciona una provincia'}
					disabled={!provinceId}
					error={errors.location?.municipality?.message}
					options={municipalitiesInProvince.map(municipality => ({
						value: municipality.name,
						label: municipality.deliveryFeeUsd
							? `${municipality.name} — envío desde $${municipality.deliveryFeeUsd.toFixed(2)}`
							: municipality.name,
					}))}
					{...register('location.municipality')}
				/>
			</SectionState>
		</div>
	);
};
