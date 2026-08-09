import { useMemo, useState } from 'react';
import { DataTable, PageHeader, SearchInput, Select } from '../../../components/ui';
import { MunicipalityFeeCell } from '../../../components/admin/deliveryZones/MunicipalityFeeCell';
import { useAdminMunicipalities, useAdminProvinces } from '../../../hooks';

export const AdminDeliveryZonesPage = () => {
	const { provinces, isLoading: isLoadingProvinces } = useAdminProvinces();
	const { municipalities, isLoading: isLoadingMunicipalities } = useAdminMunicipalities();

	const [provinceId, setProvinceId] = useState('');
	const [query, setQuery] = useState('');

	const provinceNameById = useMemo(
		() => new Map(provinces.map(province => [province.id, province.name])),
		[provinces]
	);

	const filtered = municipalities.filter(municipality => {
		if (provinceId && municipality.provinceId !== provinceId) return false;
		if (query && !municipality.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
		return true;
	});

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Zonas de entrega'
				description='Provincias y municipios donde se hacen entregas, con su tarifa de domicilio.'
			/>

			<div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
				<SearchInput
					value={query}
					onChange={event => setQuery(event.target.value)}
					onClear={() => setQuery('')}
					placeholder='Buscar municipio...'
					containerClassName='sm:max-w-xs'
				/>
				<Select
					aria-label='Filtrar por provincia'
					value={provinceId}
					onChange={event => setProvinceId(event.target.value)}
					options={[
						{ value: '', label: 'Todas las provincias' },
						...provinces.map(province => ({ value: province.id, label: province.name })),
					]}
					containerClassName='sm:max-w-xs'
				/>
			</div>

			<DataTable
				columns={[
					{ key: 'province', header: 'Provincia', render: m => provinceNameById.get(m.provinceId) ?? '—' },
					{ key: 'municipality', header: 'Municipio', render: m => m.name },
					{
						key: 'fee',
						header: 'Tarifa de domicilio (USD)',
						render: m => <MunicipalityFeeCell municipalityId={m.id} deliveryFeeUsd={m.deliveryFeeUsd} />,
					},
				]}
				data={filtered}
				getRowId={m => m.id}
				isLoading={isLoadingProvinces || isLoadingMunicipalities}
				emptyTitle='No hay municipios con ese filtro'
			/>
		</div>
	);
};
