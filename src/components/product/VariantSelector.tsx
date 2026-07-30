import { cn } from '../../helpers';
import { CatalogProductVariant } from '../../interfaces';

interface Props {
	variants: CatalogProductVariant[];
	selectedVariantId: string;
	onSelect: (variant: CatalogProductVariant) => void;
}

export const VariantSelector = ({ variants, selectedVariantId, onSelect }: Props) => {
	return (
		<div className='flex flex-col gap-2'>
			<span className='text-sm font-medium text-neutral-800'>Presentación</span>
			<div className='flex flex-wrap gap-2' role='radiogroup' aria-label='Presentación'>
				{variants.map(variant => {
					const isSelected = variant.id === selectedVariantId;

					return (
						<button
							key={variant.id}
							type='button'
							role='radio'
							aria-checked={isSelected}
							disabled={variant.stock === 0}
							onClick={() => onSelect(variant)}
							className={cn(
								'focus-ring rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
								isSelected
									? 'border-primary-600 bg-primary-50 text-primary-700'
									: 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
							)}
						>
							{variant.label}
						</button>
					);
				})}
			</div>
		</div>
	);
};
