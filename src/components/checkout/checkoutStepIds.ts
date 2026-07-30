// Lista de ids de los pasos del wizard de checkout, separada del registro de
// componentes (checkoutSteps.tsx) para que pasos como ReviewStep puedan
// referenciar el id de otro paso (para el botón "Editar") sin crear un
// import circular con el registro que sí importa los componentes de cada paso.
export const CHECKOUT_STEP_IDS = [
	'buyer',
	'recipient',
	'address',
	'location',
	'references',
	'delivery',
	'instructions',
	'review',
	'payment',
] as const;

export type CheckoutStepId = (typeof CHECKOUT_STEP_IDS)[number];
