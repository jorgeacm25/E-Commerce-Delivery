import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import { cn } from '../../helpers';
import { IconButton } from './IconButton';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface Props {
	variant?: AlertVariant;
	title?: string;
	children?: React.ReactNode;
	onClose?: () => void;
	className?: string;
}

const variantConfig: Record<AlertVariant, { classes: string; icon: React.ReactNode }> = {
	info: {
		classes: 'bg-primary-50 text-primary-800 border-primary-200',
		icon: <FiInfo className='text-primary-600' aria-hidden='true' />,
	},
	success: {
		classes: 'bg-success-50 text-success-700 border-success-500/30',
		icon: <FiCheckCircle className='text-success-600' aria-hidden='true' />,
	},
	warning: {
		classes: 'bg-warning-50 text-warning-700 border-warning-500/30',
		icon: <FiAlertTriangle className='text-warning-600' aria-hidden='true' />,
	},
	danger: {
		classes: 'bg-danger-50 text-danger-700 border-danger-500/30',
		icon: <FiAlertCircle className='text-danger-600' aria-hidden='true' />,
	},
};

export const Alert = ({ variant = 'info', title, children, onClose, className }: Props) => {
	const config = variantConfig[variant];

	return (
		<div
			role='alert'
			className={cn(
				'flex items-start gap-3 rounded-xl border p-4 text-sm',
				config.classes,
				className
			)}
		>
			<span className='mt-0.5 shrink-0'>{config.icon}</span>

			<div className='flex-1'>
				{title && <p className='font-semibold'>{title}</p>}
				{children && <div className={cn(title && 'mt-1')}>{children}</div>}
			</div>

			{onClose && (
				<IconButton
					icon={<FiX />}
					label='Cerrar aviso'
					size='sm'
					variant='ghost'
					onClick={onClose}
					className='-m-1'
				/>
			)}
		</div>
	);
};
