import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { PageSkeleton } from '../components/layout';
import {
	AdminOverviewPage,
	AdminSectionPlaceholderPage,
	CartPage,
	CatalogPage,
	CategoryPage,
	CheckoutPage,
	CombosPage,
	ContactPage,
	CustomerOrderDetailPage,
	CustomerOrdersPage,
	CustomerProfilePage,
	CustomerSectionPlaceholderPage,
	FaqPage,
	ForgotPasswordPage,
	HomePage,
	LoginPage,
	NotFoundPage,
	OrderConfirmedPage,
	PrivacyPolicyPage,
	ProductPage,
	RefundPolicyPage,
	RegisterPage,
	ResetPasswordPage,
	ShippingPolicyPage,
	TermsPage,
	TrackOrderPage,
	UiPreviewPage,
} from './lazyPages';

const withSuspense = (element: React.ReactNode) => (
	<Suspense fallback={<PageSkeleton />}>{element}</Suspense>
);

export const router = createBrowserRouter([
	{
		path: '/',
		element: <PublicLayout />,
		children: [
			{ index: true, element: withSuspense(<HomePage />) },
			{ path: 'catalogo', element: withSuspense(<CatalogPage />) },
			{ path: 'categoria/:slug', element: withSuspense(<CategoryPage />) },
			{ path: 'producto/:slug', element: withSuspense(<ProductPage />) },
			{ path: 'combos', element: withSuspense(<CombosPage />) },
			{ path: 'carrito', element: withSuspense(<CartPage />) },
			{ path: 'rastrear-pedido', element: withSuspense(<TrackOrderPage />) },
			{ path: 'iniciar-sesion', element: withSuspense(<LoginPage />) },
			{ path: 'registrarse', element: withSuspense(<RegisterPage />) },
			{ path: 'recuperar-contrasena', element: withSuspense(<ForgotPasswordPage />) },
			{ path: 'restablecer-contrasena', element: withSuspense(<ResetPasswordPage />) },
			{ path: 'contacto', element: withSuspense(<ContactPage />) },
			{ path: 'preguntas-frecuentes', element: withSuspense(<FaqPage />) },
			{ path: 'politicas/privacidad', element: withSuspense(<PrivacyPolicyPage />) },
			{ path: 'politicas/terminos', element: withSuspense(<TermsPage />) },
			{ path: 'politicas/entrega', element: withSuspense(<ShippingPolicyPage />) },
			{ path: 'politicas/reembolsos', element: withSuspense(<RefundPolicyPage />) },
			{ path: 'ui-preview', element: withSuspense(<UiPreviewPage />) },
			{
				path: 'mi-cuenta',
				element: <CustomerLayout />,
				children: [
					{ index: true, element: <Navigate to='pedidos' replace /> },
					{ path: 'pedidos', element: withSuspense(<CustomerOrdersPage />) },
					{
						path: 'pedidos/:orderNumber',
						element: withSuspense(<CustomerOrderDetailPage />),
					},
					{ path: 'perfil', element: withSuspense(<CustomerProfilePage />) },
					{ path: '*', element: withSuspense(<CustomerSectionPlaceholderPage />) },
				],
			},
			{ path: '*', element: withSuspense(<NotFoundPage />) },
		],
	},
	{
		path: '/checkout',
		element: withSuspense(<CheckoutPage />),
	},
	{
		path: '/pedido-confirmado/:orderNumber',
		element: withSuspense(<OrderConfirmedPage />),
	},
	{
		path: '/admin',
		element: <AdminLayout />,
		children: [
			{ index: true, element: withSuspense(<AdminOverviewPage />) },
			{ path: '*', element: withSuspense(<AdminSectionPlaceholderPage />) },
		],
	},
	{ path: '*', element: withSuspense(<NotFoundPage />) },
]);
