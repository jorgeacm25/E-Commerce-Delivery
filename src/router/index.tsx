import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { PageSkeleton } from '../components/layout';
import { RequireAuth } from './RequireAuth';
import { CartRedirect } from './CartRedirect';
import {
	AdminCategoriesPage,
	AdminCombosPage,
	AdminCustomersPage,
	AdminDeliveryZonesPage,
	AdminInventoryPage,
	AdminLoginPage,
	AdminOrderDetailPage,
	AdminOrdersPage,
	AdminOverviewPage,
	AdminPaymentAccountsPage,
	AdminSellersPage,
	AdminWorkersPage,
	AdminRemittancesPage,
	AdminAccountingPage,
	AdminSettingsPage,
	AdminPerformancePage,
	AdminPaymentVerificationPage,
	AdminProductFormPage,
	AdminSectionPlaceholderPage,
	CatalogPage,
	CategoryPage,
	CheckoutPage,
	CombosPage,
	ContactPage,
	CustomerAddressesPage,
	CustomerFavoritesPage,
	CustomerOrderDetailPage,
	CustomerOrdersPage,
	CustomerProfilePage,
	CustomerRecipientsPage,
	CustomerSecurityPage,
	CustomerSectionPlaceholderPage,
	CustomerSupportPage,
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
			{ path: 'carrito', element: <CartRedirect /> },
			{
				// GET /api/order/{id} exige sesión (backend .NET) — ya no hay
				// forma de rastrear un pedido como invitado sin exponer pedidos
				// ajenos, así que esta ruta también exige sesión de cliente.
				path: 'rastrear-pedido',
				element: (
					<RequireAuth allowedRoles={['customer']}>{withSuspense(<TrackOrderPage />)}</RequireAuth>
				),
			},
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
					{ path: 'destinatarios', element: withSuspense(<CustomerRecipientsPage />) },
					{ path: 'direcciones', element: withSuspense(<CustomerAddressesPage />) },
					{ path: 'favoritos', element: withSuspense(<CustomerFavoritesPage />) },
					{ path: 'seguridad', element: withSuspense(<CustomerSecurityPage />) },
					{ path: 'soporte', element: withSuspense(<CustomerSupportPage />) },
					{ path: '*', element: withSuspense(<CustomerSectionPlaceholderPage />) },
				],
			},
			{ path: '*', element: withSuspense(<NotFoundPage />) },
		],
	},
	{
		path: '/checkout',
		// El backend .NET exige un CustomerId autenticado para crear el
		// pedido (no hay checkout de invitado, ver OrderController.Create):
		// se exige sesión de cliente antes de entrar al wizard.
		element: (
			<RequireAuth allowedRoles={['customer']}>{withSuspense(<CheckoutPage />)}</RequireAuth>
		),
	},
	{
		path: '/pedido-confirmado/:orderNumber',
		element: withSuspense(<OrderConfirmedPage />),
	},
	{
		path: '/admin/iniciar-sesion',
		element: withSuspense(<AdminLoginPage />),
	},
	{
		path: '/admin',
		element: <AdminLayout />,
		children: [
			{ index: true, element: withSuspense(<AdminOverviewPage />) },
			{ path: 'pedidos', element: withSuspense(<AdminOrdersPage />) },
			{ path: 'pedidos/pagos', element: withSuspense(<AdminPaymentVerificationPage />) },
			{ path: 'pedidos/cuentas', element: withSuspense(<AdminPaymentAccountsPage />) },
			{ path: 'pedidos/:id', element: withSuspense(<AdminOrderDetailPage />) },
			// Inventario = fusión de Productos + Almacén (sección única con
			// pestañas). Las rutas viejas redirigen para no romper enlaces
			// guardados; los formularios de producto conservan su path.
			{ path: 'inventario', element: withSuspense(<AdminInventoryPage />) },
			{ path: 'productos', element: <Navigate to='/admin/inventario' replace /> },
			{ path: 'productos/nuevo', element: withSuspense(<AdminProductFormPage />) },
			{ path: 'productos/:id/editar', element: withSuspense(<AdminProductFormPage />) },
			{ path: 'categorias', element: withSuspense(<AdminCategoriesPage />) },
			{ path: 'combos', element: withSuspense(<AdminCombosPage />) },
			{ path: 'almacen', element: <Navigate to='/admin/inventario' replace /> },
			{ path: 'clientes', element: withSuspense(<AdminCustomersPage />) },
			{ path: 'vendedores', element: withSuspense(<AdminSellersPage />) },
			{ path: 'trabajadores', element: withSuspense(<AdminWorkersPage />) },
			{ path: 'remesas', element: withSuspense(<AdminRemittancesPage />) },
			{ path: 'contabilidad', element: withSuspense(<AdminAccountingPage />) },
			{ path: 'configuracion', element: withSuspense(<AdminSettingsPage />) },
			{ path: 'rendimiento', element: withSuspense(<AdminPerformancePage />) },
			{ path: 'zonas-entrega', element: withSuspense(<AdminDeliveryZonesPage />) },
			{ path: '*', element: withSuspense(<AdminSectionPlaceholderPage />) },
		],
	},
	{ path: '*', element: withSuspense(<NotFoundPage />) },
]);
