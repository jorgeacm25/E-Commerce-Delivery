import { ComboWithItems } from '../../../interfaces';
import { formatPrice } from '../../../helpers';
import { useManageCombo } from '../../../hooks';

interface Props {
	combos: ComboWithItems[];
}

export const TableCombos = ({ combos }: Props) => {
	const { toggleActivo, remove } = useManageCombo();

	if (combos.length === 0) {
		return (
			<p className='text-sm text-gray-600'>
				Aún no hay combos creados.
			</p>
		);
	}

	return (
		<table className='text-sm w-full caption-bottom'>
			<thead className='border-b border-gray-200'>
				<tr className='text-sm font-bold'>
					<th className='h-12 px-4 text-left'>Combo</th>
					<th className='h-12 px-4 text-left'>Incluye</th>
					<th className='h-12 px-4 text-left'>Precio</th>
					<th className='h-12 px-4 text-left'>Activo</th>
					<th className='h-12 px-4 text-left'></th>
				</tr>
			</thead>

			<tbody className='[&_tr:last-child]:border-0'>
				{combos.map(combo => (
					<tr key={combo.id} className='border-b border-gray-100'>
						<td className='p-4 font-medium'>{combo.nombre}</td>
						<td className='p-4 text-gray-600'>
							{combo.combo_items
								.map(
									item =>
										`${item.cantidad}x ${
											item.variants?.products?.name ??
											''
										}`
								)
								.join(', ')}
						</td>
						<td className='p-4 font-medium'>
							{formatPrice(combo.precio_combo_usd)}
						</td>
						<td className='p-4'>
							<input
								type='checkbox'
								checked={combo.activo}
								onChange={e =>
									toggleActivo({
										id: combo.id,
										activo: e.target.checked,
									})
								}
							/>
						</td>
						<td className='p-4'>
							<button
								onClick={() => remove(combo.id)}
								className='text-red-500 text-xs font-semibold uppercase'
							>
								Eliminar
							</button>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};
