import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';

export interface CatalogFilterValues {
	categorySlug: string;
	availability: string;
	minPrice: string;
	maxPrice: string;
}

const availabilityOptions: SelectOption[] = [
	{ value: '', label: 'Todas' },
	{ value: 'in_stock', label: 'Disponibles' },
	{ value: 'out_of_stock', label: 'Agotados' },
];

interface Props {
	values: CatalogFilterValues;
	onChange: (values: CatalogFilterValues) => void;
	categoryOptions: SelectOption[];
	showCategoryFilter: boolean;
}

export const FilterPanel = ({ values, onChange, categoryOptions, showCategoryFilter }: Props) => {
	return (
		<div className='flex flex-col gap-5'>
			{showCategoryFilter && (
				<Select
					label='Categoría'
					value={values.categorySlug}
					options={categoryOptions}
					onChange={event => onChange({ ...values, categorySlug: event.target.value })}
				/>
			)}

			<Select
				label='Disponibilidad'
				value={values.availability}
				options={availabilityOptions}
				onChange={event => onChange({ ...values, availability: event.target.value })}
			/>

			<div className='flex flex-col gap-1.5'>
				<span className='text-sm font-medium text-neutral-800'>Precio (USD)</span>
				<div className='flex items-center gap-2'>
					<Input
						type='number'
						min={0}
						inputMode='decimal'
						aria-label='Precio mínimo'
						placeholder='Mín'
						value={values.minPrice}
						onChange={event => onChange({ ...values, minPrice: event.target.value })}
					/>
					<span className='text-neutral-400'>–</span>
					<Input
						type='number'
						min={0}
						inputMode='decimal'
						aria-label='Precio máximo'
						placeholder='Máx'
						value={values.maxPrice}
						onChange={event => onChange({ ...values, maxPrice: event.target.value })}
					/>
				</div>
			</div>
		</div>
	);
};
