/* ********************************** */
/*              PRODUCTOS             */
/* ********************************** */
export * from './products/useProducts';
export * from './products/useFilteredProducts';
export * from './products/useHomeProducts';
export * from './products/useCreateProduct';
export * from './products/useProduct';
export * from './products/useDeleteProduct';
export * from './products/useUpdateProduct';

/* ********************************** */
/*                AUTH                */
/* ********************************** */
export * from './auth/useAuth';

/* ********************************** */
/*               ORDERS               */
/* ********************************** */
export * from './orders/useCreateOrder';
export * from './orders/useOrder';
export * from './orders/useOrders';
export * from './orders/useAllOrders';
export * from './orders/useChangeStatusOrder';
export * from './orders/useOrderAdmin';

/* ********************************** */
/*               PAGOS                */
/* ********************************** */
export * from './payments/useActivePaymentAccount';
export * from './payments/useUploadPaymentProof';
export * from './payments/usePendingPaymentProofs';
export * from './payments/useReviewPaymentProof';
export * from './payments/usePaymentProofSignedUrl';
export * from './payments/useActiveExchangeRate';
export * from './payments/useUpdateExchangeRate';

/* ********************************** */
/*               COMBOS               */
/* ********************************** */
export * from './combos/useActiveCombos';

/* ********************************** */
/*    INICIO (contenido simulado)     */
/* ********************************** */
export * from './home/useFeaturedCategories';
export * from './home/useFamilyCombos';
export * from './home/usePopularProductsHome';
export * from './home/useHowItWorksSteps';
export * from './home/useDeliveryZones';
export * from './home/useHomeBenefits';
export * from './home/useHomeGuarantees';
export * from './home/useTestimonials';
export * from './home/useHomeFaqs';

/* ********************************** */
/*   CATÁLOGO (contenido simulado)    */
/* ********************************** */
export * from './catalog/useCategories';
export * from './catalog/useCatalogProducts';
export * from './catalog/useCatalogProduct';
export * from './catalog/useRelatedProducts';
export * from './catalog/useCombos';

/* ********************************** */
/*         ÁREA DE CLIENTE            */
/* ********************************** */
export * from './profile/useUpdateProfile';
export * from './addresses/useAddresses';
export * from './addresses/useManageAddresses';
export * from './recipients/useRecipients';
export * from './recipients/useManageRecipients';
export * from './favorites/useFavorites';
export * from './favorites/useToggleFavorite';
export * from './support/useSupportCases';
export * from './support/useCreateSupportCase';
export * from './orders/useCustomerOrders';

/* ********************************** */
/*          PANEL ADMIN (Fase B)      */
/* ********************************** */
export * from './adminCategories/useAdminCategories';
export * from './adminCategories/useManageCategories';
export * from './adminProducts/useAdminProducts';
export * from './adminProducts/useAdminProduct';
export * from './adminProducts/useManageProducts';
export * from './adminDashboard/useAdminDashboardMockStats';
export * from './adminDashboard/useAdminDashboardStats';
export * from './orders/useOrdersSummary';
export * from './orders/useAdminOrderDetail';
export * from './orders/useAdminOrders';
export * from './orders/useAdminOrderStatus';
export * from './orders/useAdminOrdersSummary';
export * from './almacen/useWarehouseHistory';
export * from './almacen/useStockAlerts';
export * from './almacen/useRegisterProductOut';
export * from './paymentAccounts/usePaymentAccounts';
export * from './paymentAccounts/useManagePaymentAccounts';
export * from './adminCustomers/useAdminCustomers';
export * from './adminCustomers/useManageCustomers';
export * from './adminSellers/useAdminSellers';
export * from './adminSellers/useManageSellers';
export * from './adminWorkers/useAdminWorkers';
export * from './adminWorkers/useManageWorkers';
export * from './adminRemittances/useAdminRemittances';
export * from './adminRemittances/useManageRemittances';
export * from './adminAccounting/useLedgerEntries';
export * from './adminAccounting/useManageExpenses';
export * from './adminPerformance/usePerformanceSummary';
export * from './adminAccounts/useAdminAccounts';
export * from './adminAccounts/useManageAdminAccounts';
export * from './adminCombos/useAdminCombos';
export * from './adminCombos/useManageCombos';
export * from './adminCombos/useProductsForComboSelector';
export * from './adminDeliveryZones/useDeliveryZones';
export * from './adminDeliveryZones/useManageDeliveryZones';
export * from './agencyContact/useActiveAgencyContact';
export * from './agencyContact/useUpdateAgencyContact';
