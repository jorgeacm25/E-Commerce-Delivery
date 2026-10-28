import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fuentes autoalojadas (sin depender de Google Fonts). Fraunces "full"
// incluye los ejes SOFT y WONK que usan los titulares.
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/onest';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import {
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RouterProvider router={router} />
				<Toaster />
			</AuthProvider>
		</QueryClientProvider>
	</StrictMode>
);
