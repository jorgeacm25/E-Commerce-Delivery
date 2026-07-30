import { cn } from '../../helpers';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

export interface DataTableColumn<T> {
	key: string;
	header: string;
	render: (row: T) => React.ReactNode;
	className?: string;
}

interface Props<T> {
	columns: DataTableColumn<T>[];
	data: T[];
	getRowId: (row: T) => string | number;
	isLoading?: boolean;
	emptyTitle?: string;
	emptyDescription?: string;
	onRowClick?: (row: T) => void;
	className?: string;
}

export const DataTable = <T,>({
	columns,
	data,
	getRowId,
	isLoading = false,
	emptyTitle = 'Sin resultados',
	emptyDescription,
	onRowClick,
	className,
}: Props<T>) => {
	return (
		<div className={cn('overflow-x-auto rounded-xl border border-neutral-200', className)}>
			<table className='w-full text-left text-sm'>
				<thead className='bg-neutral-50 text-xs font-semibold uppercase text-neutral-500'>
					<tr>
						{columns.map(column => (
							<th key={column.key} scope='col' className='px-4 py-3'>
								{column.header}
							</th>
						))}
					</tr>
				</thead>

				<tbody className='divide-y divide-neutral-100'>
					{isLoading &&
						Array.from({ length: 4 }).map((_, rowIndex) => (
							<tr key={`skeleton-${rowIndex}`}>
								{columns.map(column => (
									<td key={column.key} className='px-4 py-3'>
										<Skeleton variant='text' />
									</td>
								))}
							</tr>
						))}

					{!isLoading &&
						data.map(row => (
							<tr
								key={getRowId(row)}
								onClick={onRowClick ? () => onRowClick(row) : undefined}
								className={cn(
									'text-neutral-700',
									onRowClick && 'cursor-pointer hover:bg-neutral-50'
								)}
							>
								{columns.map(column => (
									<td key={column.key} className={cn('px-4 py-3', column.className)}>
										{column.render(row)}
									</td>
								))}
							</tr>
						))}
				</tbody>
			</table>

			{!isLoading && data.length === 0 && (
				<div className='p-6'>
					<EmptyState title={emptyTitle} description={emptyDescription} />
				</div>
			)}
		</div>
	);
};
