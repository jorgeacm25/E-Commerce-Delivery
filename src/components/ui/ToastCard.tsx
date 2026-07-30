import toast, { Toast as HotToast } from 'react-hot-toast';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import { cn } from '../../helpers';
import { AlertVariant } from './Alert';

const variantConfig: Record<AlertVariant, { classes: string; icon: React.ReactNode }> = {
	info: {
		classes: 'border-primary-200 text-primary-800',
		icon: <FiInfo className='text-primary-600 shrink-0' aria-hidden='true' />,
	},
	success: {
		classes: 'border-success-500/30 text-success-700',
		icon: <FiCheckCircle className='text-success-600 shrink-0' aria-hidden='true' />,
	},
	warning: {
		classes: 'border-warning-500/30 text-warning-700',
		icon: <FiAlertCircle className='text-warning-600 shrink-0' aria-hidden='true' />,
	},
	danger: {
		classes: 'border-danger-500/30 text-danger-700',
		icon: <FiAlertCircle className='text-danger-600 shrink-0' aria-hidden='true' />,
	},
};

interface Props {
	t: HotToast;
	variant: AlertVariant;
	message: string;
}

export const ToastCard = ({ t, variant, message }: Props) => {
	const config = variantConfig[variant];

	return (
		<div
			role='status'
			className={cn(
				'flex items-start gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm font-medium shadow-popover',
				t.visible ? 'animate-scale-in' : 'opacity-0',
				config.classes
			)}
		>
			{config.icon}
			<span className='flex-1'>{message}</span>
			<button
				onClick={() => toast.dismiss(t.id)}
				aria-label='Cerrar notificación'
				className='focus-ring rounded text-neutral-400 hover:text-neutral-700'
			>
				<FiX />
			</button>
		</div>
	);
};
