import { FiMinus, FiPlus } from 'react-icons/fi';
import { cn } from '../../helpers';

interface Props {
	quantity: number;
	onChange: (quantity: number) => void;
	min?: number;
	max?: number;
	className?: string;
}

export const QuantitySelector = ({ quantity, onChange, min = 1, max, className }: Props) => {
	const canDecrease = quantity > min;
	const canIncrease = max === undefined || quantity < max;

	const handleDecrease = () => {
		if (canDecrease) onChange(quantity - 1);
	};

	const handleIncrease = () => {
		if (canIncrease) onChange(quantity + 1);
	};

	return (
		<div
			className={cn(
				'inline-flex items-center rounded-lg border border-neutral-300',
				className
			)}
		>
			<button
				type='button'
				aria-label='Disminuir cantidad'
				disabled={!canDecrease}
				onClick={handleDecrease}
				className='focus-ring flex h-9 w-9 items-center justify-center rounded-l-lg text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
			>
				<FiMinus />
			</button>

			<span
				role='status'
				aria-live='polite'
				className='flex h-9 w-10 items-center justify-center text-sm font-semibold text-neutral-900'
			>
				{quantity}
			</span>

			<button
				type='button'
				aria-label='Aumentar cantidad'
				disabled={!canIncrease}
				onClick={handleIncrease}
				className='focus-ring flex h-9 w-9 items-center justify-center rounded-r-lg text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
			>
				<FiPlus />
			</button>
		</div>
	);
};
