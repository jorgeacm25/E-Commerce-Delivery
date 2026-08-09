import { getStatus } from '../../helpers';
import { Badge, BadgeVariant } from './Badge';

const statusVariant: Record<string, BadgeVariant> = {
	Pending: 'warning',
	Paid: 'primary',
	Shipped: 'secondary',
	Delivered: 'success',
	Cancelled: 'danger',
};

interface Props {
	status: string;
	className?: string;
}

export const OrderStatusBadge = ({ status, className }: Props) => {
	return (
		<Badge variant={statusVariant[status] ?? 'neutral'} className={className}>
			{getStatus(status)}
		</Badge>
	);
};
