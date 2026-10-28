import { Link } from 'react-router-dom';
import { cn } from '../../helpers';

interface Props {
	className?: string;
	/** `light`: texto claro para fondos oscuros (navbar verde). */
	tone?: 'dark' | 'light';
}

export const Logo = ({ className, tone = 'dark' }: Props) => {
	return (
		<Link
			to='/'
			className={cn(
				'focus-ring inline-flex items-center gap-1 rounded-lg text-xl font-extrabold tracking-tight',
				tone === 'light' ? 'text-white' : 'text-neutral-900',
				className
			)}
		>
			Delivery
			<span className={tone === 'light' ? 'text-primary-400' : 'text-primary-600'}>Home</span>
		</Link>
	);
};
