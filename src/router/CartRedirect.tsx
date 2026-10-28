import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useGlobalStore } from '../store/global.store';

// /carrito ya no es una página: el carrito vive en un panel lateral. La ruta
// se conserva para enlaces guardados o compartidos; abre el panel y lleva a
// la portada.
export const CartRedirect = () => {
	const openSheet = useGlobalStore(state => state.openSheet);

	useEffect(() => {
		openSheet('cart');
	}, [openSheet]);

	return <Navigate to='/' replace />;
};
