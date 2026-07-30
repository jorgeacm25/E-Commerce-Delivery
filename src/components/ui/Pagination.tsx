import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '../../helpers';

interface Props {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

const getPageNumbers = (page: number, totalPages: number): (number | 'ellipsis')[] => {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
	const sorted = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);

	const result: (number | 'ellipsis')[] = [];
	sorted.forEach((current, index) => {
		if (index > 0 && current - sorted[index - 1] > 1) {
			result.push('ellipsis');
		}
		result.push(current);
	});

	return result;
};

export const Pagination = ({ page, totalPages, onPageChange, className }: Props) => {
	if (totalPages <= 1) return null;

	const pageNumbers = getPageNumbers(page, totalPages);

	return (
		<nav
			aria-label='Paginación'
			className={cn('flex items-center justify-center gap-1', className)}
		>
			<button
				type='button'
				aria-label='Página anterior'
				disabled={page === 1}
				onClick={() => onPageChange(page - 1)}
				className='focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
			>
				<FiChevronLeft />
			</button>

			{pageNumbers.map((item, index) =>
				item === 'ellipsis' ? (
					<span key={`ellipsis-${index}`} className='px-1 text-neutral-400'>
						…
					</span>
				) : (
					<button
						key={item}
						type='button'
						aria-current={item === page ? 'page' : undefined}
						onClick={() => onPageChange(item)}
						className={cn(
							'focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
							item === page
								? 'bg-primary-600 text-white'
								: 'text-neutral-700 hover:bg-neutral-100'
						)}
					>
						{item}
					</button>
				)
			)}

			<button
				type='button'
				aria-label='Página siguiente'
				disabled={page === totalPages}
				onClick={() => onPageChange(page + 1)}
				className='focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
			>
				<FiChevronRight />
			</button>
		</nav>
	);
};
