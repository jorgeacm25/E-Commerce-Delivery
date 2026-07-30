import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useDeliveryZones } from '../../../hooks';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { SectionState } from '../../home/SectionState';
import { Select, Skeleton } from '../../ui';

// Provincia y municipio de entrega, sobre las zonas ya definidas para el
// resto del sitio (useDeliveryZones, mismo servicio simulado que usa
// HomePage/ProductDeliveryZones). Las provincias sin cobertura se muestran
// pero deshabilitadas en vez de ocultarse, para que el cliente entienda por
// qué no puede seleccionarlas.
export const LocationStep = () => {
	const {
		register,
		control,
		setValue,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	const { zones, isLoading, isError, refetch } = useDeliveryZones();

	const provinceId = useWatch({ control, name: 'location.provinceId' });
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		setValue('location.municipality', '', { shouldValidate: false });
	}, [provinceId, setValue]);

	const selectedZone = zones.find(zone => zone.id === provinceId);

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>Provincia y municipio donde vive el destinatario.</p>

			<SectionState
				isLoading={isLoading}
				isError={isError}
				isEmpty={!isLoading && !isError && zones.length === 0}
				onRetry={refetch}
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
					options={zones.map(zone => ({
						value: zone.id,
						label: zone.available ? zone.province : `${zone.province} (próximamente)`,
						disabled: !zone.available,
					}))}
					{...register('location.provinceId')}
				/>

				<Select
					label='Municipio'
					required
					placeholder={selectedZone ? 'Selecciona un municipio' : 'Primero selecciona una provincia'}
					disabled={!selectedZone}
					error={errors.location?.municipality?.message}
					options={(selectedZone?.municipalities ?? []).map(municipality => ({
						value: municipality,
						label: municipality,
					}))}
					{...register('location.municipality')}
				/>
			</SectionState>
		</div>
	);
};
