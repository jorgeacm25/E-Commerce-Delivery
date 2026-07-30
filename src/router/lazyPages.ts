import { lazyNamed } from './lazyNamed';

export const HomePage = lazyNamed(() => import('../pages/public/HomePage'), 'HomePage');
export const CatalogPage = lazyNamed(() => import('../pages/public/CatalogPage'), 'CatalogPage');
export const CategoryPage = lazyNamed(
	() => import('../pages/public/CategoryPage'),
	'CategoryPage'
);
export const ProductPage = lazyNamed(() => import('../pages/public/ProductPage'), 'ProductPage');
export const CombosPage = lazyNamed(() => import('../pages/public/CombosPage'), 'CombosPage');
export const CartPage = lazyNamed(() => import('../pages/public/CartPage'), 'CartPage');
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

export const AdminOverviewPage = lazyNamed(
	() => import('../pages/admin/AdminOverviewPage'),
	'AdminOverviewPage'
);
export const AdminSectionPlaceholderPage = lazyNamed(
	() => import('../pages/admin/AdminSectionPlaceholderPage'),
	'AdminSectionPlaceholderPage'
);
