import toast from 'react-hot-toast';
import { AlertVariant } from './Alert';
import { ToastCard } from './ToastCard';

const showToast = (variant: AlertVariant, message: string) =>
	toast.custom(t => <ToastCard t={t} variant={variant} message={message} />);

export const showSuccessToast = (message: string) => showToast('success', message);
export const showErrorToast = (message: string) => showToast('danger', message);
export const showInfoToast = (message: string) => showToast('info', message);
export const showWarningToast = (message: string) => showToast('warning', message);
