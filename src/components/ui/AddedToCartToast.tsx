import toast, { Toast as HotToast } from 'react-hot-toast';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import { cn } from '../../helpers';

interface Props {
	t: HotToast;
	name: string;
	image?: string;
	quantity: number;
}

// Notificación que confirma que un producto entró al carrito: miniatura,
// nombre y cantidad añadida.
export const AddedToCartToast = ({ t, name, image, quantity }: Props) => {
	return (
		<div
			role='status'
			className={cn(
				'flex w-80 max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-success-500/30 bg-white p-3 shadow-popover',
				t.visible ? 'animate-scale-in' : 'opacity-0'
			)}
		>
			{image && (
				<img
					src={image}
					alt=''
					className='h-12 w-12 shrink-0 rounded-lg bg-neutral-50 object-contain p-1'
				/>
			)}
			<div className='min-w-0 flex-1'>
				<p className='flex items-center gap-1.5 text-sm font-semibold text-success-700'>
					<FiCheckCircle className='shrink-0' aria-hidden='true' />
					Agregado al carrito
				</p>
				<p className='line-clamp-1 text-sm text-neutral-700'>
					{quantity > 1 ? `${quantity} × ` : ''}
					{name}
				</p>
			</div>
			<button
				onClick={() => toast.dismiss(t.id)}
				aria-label='Cerrar notificación'
				className='focus-ring self-start rounded text-neutral-400 hover:text-neutral-700'
			>
				<FiX />
			</button>
		</div>
	);
};
