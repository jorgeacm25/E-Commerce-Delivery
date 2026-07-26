import { useActiveCombos } from '../hooks';
import { Loader } from '../components/shared/Loader';
import { formatPrice } from '../helpers';

export const CombosPage = () => {
	const { data: combos, isLoading } = useActiveCombos();

	if (isLoading) return <Loader />;

	return (
		<div className='container py-16 space-y-10'>
			<h1 className='text-3xl font-bold tracking-tight'>Combos</h1>

			{!combos || combos.length === 0 ? (
				<p className='text-sm text-gray-600'>
					No hay combos disponibles en este momento.
				</p>
			) : (
				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{combos.map(combo => (
						<div
							key={combo.id}
							className='border border-slate-200 rounded-md p-5 space-y-3'
						>
							<h3 className='font-semibold text-lg'>
								{combo.nombre}
							</h3>

							{combo.descripcion && (
								<p className='text-sm text-gray-600'>
									{combo.descripcion}
								</p>
							)}

							<ul className='text-sm space-y-1'>
								{combo.combo_items.map(item => (
									<li key={item.id}>
										{item.cantidad}x{' '}
										{item.variants?.products?.name} (
										{item.variants?.color_name} /{' '}
										{item.variants?.storage})
									</li>
								))}
							</ul>

							<p className='font-bold text-xl'>
								{formatPrice(combo.precio_combo_usd)}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
