import { FiHeart } from 'react-icons/fi';
import { cn } from '../../helpers';
import { useAuth, useFavorites, useToggleFavorite } from '../../hooks';

interface Props {
	productId: string;
	className?: string;
}

// Solo se muestra con sesión activa (favoritos requiere cuenta). Sin sesión,
// el botón simplemente no se renderiza en vez de llevar a iniciar sesión a
// mitad de la ficha de producto.
export const FavoriteButton = ({ productId, className }: Props) => {
	const { user } = useAuth();
	const { favorites } = useFavorites(user?.id);
	const { add, remove, isAdding, isRemoving } = useToggleFavorite(user?.id);

	if (!user) return null;

	const isFavorite = favorites.some(favorite => favorite.productId === productId);

	return (
		<button
			type='button'
			onClick={() => (isFavorite ? remove(productId) : add(productId))}
			disabled={isAdding || isRemoving}
			aria-pressed={isFavorite}
			aria-label={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
			className={cn(
				'focus-ring flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed',
				isFavorite
					? 'border-danger-200 bg-danger-50 text-danger-500'
					: 'border-neutral-300 bg-white text-neutral-400 hover:text-danger-500',
				className
			)}
		>
			<FiHeart className={cn(isFavorite && 'fill-current')} aria-hidden='true' />
		</button>
	);
};
