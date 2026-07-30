import { CatalogComboItem } from '../../interfaces';

interface Props {
	items: CatalogComboItem[];
}

export const ComboContents = ({ items }: Props) => {
	return (
		<div className='flex flex-col gap-2'>
			<span className='text-sm font-medium text-neutral-800'>Contenido del combo</span>
			<ul className='flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4'>
				{items.map((item, index) => (
					<li key={index} className='flex items-center gap-3'>
						<img
							src={item.imageUrl}
							alt=''
							aria-hidden='true'
							className='h-10 w-10 object-contain'
						/>
						<span className='text-sm text-neutral-700'>
							{item.quantity} {item.unit} de {item.productName}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
};
