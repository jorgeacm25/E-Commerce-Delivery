import { Link } from 'react-router-dom';
import { cn } from '../../helpers';

interface Props {
	className?: string;
}

export const Logo = ({ className }: Props) => {
	return (
		<Link
			to='/'
			className={cn(
				'focus-ring inline-flex items-center gap-1 rounded-lg text-xl font-extrabold tracking-tight text-neutral-900',
				className
			)}
		>
			Delivery
			<span className='text-primary-600'>Home</span>
		</Link>
	);
};
