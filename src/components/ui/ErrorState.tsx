import { FiAlertTriangle } from 'react-icons/fi';
import { cn } from '../../helpers';
import { Button } from './Button';

interface Props {
	title?: string;
	description?: string;
	onRetry?: () => void;
	className?: string;
}

export const ErrorState = ({
	title = 'Algo salió mal',
	description = 'Ocurrió un error inesperado. Inténtalo de nuevo.',
	onRetry,
	className,
}: Props) => {
	return (
		<div
			role='alert'
			className={cn(
				'flex flex-col items-center gap-3 rounded-2xl border border-danger-200 bg-danger-50 px-6 py-12 text-center',
				className
			)}
		>
			<span className='flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-danger-500'>
				<FiAlertTriangle aria-hidden='true' />
			</span>

			<div>
				<p className='font-semibold text-danger-700'>{title}</p>
				<p className='mt-1 text-sm text-danger-600'>{description}</p>
			</div>

			{onRetry && (
				<Button variant='danger' onClick={onRetry}>
					Reintentar
				</Button>
			)}
		</div>
	);
};
