// Barril del checkout nuevo (wizard por pasos, ver src/pages/public/CheckoutPage.tsx).
// Los componentes legacy de celulares en esta misma carpeta (FormCheckout,
// InputAddress, PaymentProofUpload, ItemsCheckout) siguen sin enlazarse
// desde aquí: no están en uso desde el router y se importan por ruta
// directa donde todavía se referencian (ver docs/PROJECT_STATE.md).
export * from './checkoutStepIds';
export * from './checkoutStepMeta';
export * from './CheckoutStepper';
export * from './CheckoutOrderSummary';
export * from './steps';
