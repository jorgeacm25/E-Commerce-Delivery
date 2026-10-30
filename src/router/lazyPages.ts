import { lazyNamed } from './lazyNamed';

export const HomePage = lazyNamed(() => import('../pages/public/HomePage'), 'HomePage');
export const CatalogPage = lazyNamed(() => import('../pages/public/CatalogPage'), 'CatalogPage');
export const CategoryPage = lazyNamed(
	() => import('../pages/public/CategoryPage'),
	'CategoryPage'
);
export const ProductPage = lazyNamed(() => import('../pages/public/ProductPage'), 'ProductPage');
export const CombosPage = lazyNamed(() => import('../pages/public/CombosPage'), 'CombosPage');
export const CheckoutPage = lazyNamed(
	() => import('../pages/public/CheckoutPage'),
	'CheckoutPage'
);
export const OrderConfirmedPage = lazyNamed(
	() => import('../pages/public/OrderConfirmedPage'),
	'OrderConfirmedPage'
);
export const TrackOrderPage = lazyNamed(
	() => import('../pages/public/TrackOrderPage'),
	'TrackOrderPage'
);
export const LoginPage = lazyNamed(() => import('../pages/public/LoginPage'), 'LoginPage');
export const RegisterPage = lazyNamed(
	() => import('../pages/public/RegisterPage'),
	'RegisterPage'
);
export const ForgotPasswordPage = lazyNamed(
	() => import('../pages/public/ForgotPasswordPage'),
	'ForgotPasswordPage'
);
export const ResetPasswordPage = lazyNamed(
	() => import('../pages/public/ResetPasswordPage'),
	'ResetPasswordPage'
);
export const ContactPage = lazyNamed(() => import('../pages/public/ContactPage'), 'ContactPage');
export const FaqPage = lazyNamed(() => import('../pages/public/FaqPage'), 'FaqPage');
export const PrivacyPolicyPage = lazyNamed(
	() => import('../pages/public/PrivacyPolicyPage'),
	'PrivacyPolicyPage'
);
export const TermsPage = lazyNamed(() => import('../pages/public/TermsPage'), 'TermsPage');
export const ShippingPolicyPage = lazyNamed(
	() => import('../pages/public/ShippingPolicyPage'),
	'ShippingPolicyPage'
);
export const RefundPolicyPage = lazyNamed(
	() => import('../pages/public/RefundPolicyPage'),
	'RefundPolicyPage'
);
export const NotFoundPage = lazyNamed(
	() => import('../pages/public/NotFoundPage'),
	'NotFoundPage'
);
export const UiPreviewPage = lazyNamed(() => import('../pages/UiPreviewPage'), 'UiPreviewPage');

export const CustomerOrdersPage = lazyNamed(
	() => import('../pages/customer/CustomerOrdersPage'),
	'CustomerOrdersPage'
);
export const CustomerOrderDetailPage = lazyNamed(
	() => import('../pages/customer/CustomerOrderDetailPage'),
	'CustomerOrderDetailPage'
);
export const CustomerProfilePage = lazyNamed(
	() => import('../pages/customer/CustomerProfilePage'),
	'CustomerProfilePage'
);
export const CustomerSectionPlaceholderPage = lazyNamed(
	() => import('../pages/customer/CustomerSectionPlaceholderPage'),
	'CustomerSectionPlaceholderPage'
);
export const CustomerRecipientsPage = lazyNamed(
	() => import('../pages/customer/CustomerRecipientsPage'),
	'CustomerRecipientsPage'
);
export const CustomerAddressesPage = lazyNamed(
	() => import('../pages/customer/CustomerAddressesPage'),
	'CustomerAddressesPage'
);
export const CustomerFavoritesPage = lazyNamed(
	() => import('../pages/customer/CustomerFavoritesPage'),
	'CustomerFavoritesPage'
);
export const CustomerSecurityPage = lazyNamed(
	() => import('../pages/customer/CustomerSecurityPage'),
	'CustomerSecurityPage'
);
export const CustomerSupportPage = lazyNamed(
	() => import('../pages/customer/CustomerSupportPage'),
	'CustomerSupportPage'
);

export const AdminLoginPage = lazyNamed(
	() => import('../pages/admin/AdminLoginPage'),
	'AdminLoginPage'
);
export const AdminOverviewPage = lazyNamed(
	() => import('../pages/admin/AdminOverviewPage'),
	'AdminOverviewPage'
);
export const AdminSectionPlaceholderPage = lazyNamed(
	() => import('../pages/admin/AdminSectionPlaceholderPage'),
	'AdminSectionPlaceholderPage'
);
export const AdminOrdersPage = lazyNamed(
	() => import('../pages/admin/orders/AdminOrdersPage'),
	'AdminOrdersPage'
);
export const AdminOrderDetailPage = lazyNamed(
	() => import('../pages/admin/orders/AdminOrderDetailPage'),
	'AdminOrderDetailPage'
);
export const AdminPaymentVerificationPage = lazyNamed(
	() => import('../pages/admin/orders/AdminPaymentVerificationPage'),
	'AdminPaymentVerificationPage'
);
export const AdminInventoryPage = lazyNamed(
	() => import('../pages/admin/inventario/AdminInventoryPage'),
	'AdminInventoryPage'
);
export const AdminProductFormPage = lazyNamed(
	() => import('../pages/admin/products/AdminProductFormPage'),
	'AdminProductFormPage'
);
export const AdminCategoriesPage = lazyNamed(
	() => import('../pages/admin/categories/AdminCategoriesPage'),
	'AdminCategoriesPage'
);
export const AdminCombosPage = lazyNamed(
	() => import('../pages/admin/combos/AdminCombosPage'),
	'AdminCombosPage'
);
export const AdminPaymentAccountsPage = lazyNamed(
	() => import('../pages/admin/payments/AdminPaymentAccountsPage'),
	'AdminPaymentAccountsPage'
);
export const AdminCustomersPage = lazyNamed(
	() => import('../pages/admin/customers/AdminCustomersPage'),
	'AdminCustomersPage'
);
export const AdminSellersPage = lazyNamed(
	() => import('../pages/admin/sellers/AdminSellersPage'),
	'AdminSellersPage'
);
export const AdminWorkersPage = lazyNamed(
	() => import('../pages/admin/workers/AdminWorkersPage'),
	'AdminWorkersPage'
);
export const AdminRemittancesPage = lazyNamed(
	() => import('../pages/admin/remittances/AdminRemittancesPage'),
	'AdminRemittancesPage'
);
export const AdminAccountingPage = lazyNamed(
	() => import('../pages/admin/accounting/AdminAccountingPage'),
	'AdminAccountingPage'
);
export const AdminSettingsPage = lazyNamed(
	() => import('../pages/admin/settings/AdminSettingsPage'),
	'AdminSettingsPage'
);
export const AdminPerformancePage = lazyNamed(
	() => import('../pages/admin/performance/AdminPerformancePage'),
	'AdminPerformancePage'
);
export const AdminDeliveryZonesPage = lazyNamed(
	() => import('../pages/admin/deliveryZones/AdminDeliveryZonesPage'),
	'AdminDeliveryZonesPage'
);
