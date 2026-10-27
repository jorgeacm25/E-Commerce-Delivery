import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiShoppingBag } from 'react-icons/fi';
import { Logo } from '../../components/layout';
import {
	CHECKOUT_STEPS,
	CheckoutOrderSummary,
	CheckoutStepId,
	CheckoutStepper,
	AddressStep,
	BuyerStep,
	DeliveryModalityStep,
	InstructionsStep,
	LocationStep,
	PaymentStep,
	RecipientStep,
	ReferencesStep,
	ReviewStep,
} from '../../components/checkout';
import { Alert, Button, EmptyState, Skeleton } from '../../components/ui';
import { DELIVERY_MODALITY_OPTIONS } from '../../constants/checkout';
import { useAuth } from '../../hooks';
import { CheckoutFormValues, checkoutDefaultValues, checkoutFormSchema } from '../../lib/checkoutValidators';
import { createOrder } from '../../services/order.service';
import { useCartStore } from '../../store/cart.store';

const DRAFT_STORAGE_KEY = 'dh-checkout-draft';

// Mapea cada paso del wizard a la sección del schema que debe validarse
// antes de avanzar (react-hook-form valida objetos anidados completos al
// pasarles la clave de nivel superior a trigger()).
const STEP_SCHEMA_KEY: Record<CheckoutStepId, keyof CheckoutFormValues> = {
	buyer: 'buyer',
	recipient: 'recipient',
	address: 'address',
	location: 'location',
	references: 'references',
	delivery: 'delivery',
	instructions: 'instructions',
	review: 'consent',
	payment: 'payment',
};

const sectionOrDefault = <T extends object>(value: unknown, fallback: T): T =>
	value && typeof value === 'object' ? { ...fallback, ...(value as Partial<T>) } : fallback;

const loadDraft = (): CheckoutFormValues => {
	try {
		const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
		if (!raw) return checkoutDefaultValues;

		const parsed = JSON.parse(raw) as Partial<CheckoutFormValues> | null;

		return {
			buyer: sectionOrDefault(parsed?.buyer, checkoutDefaultValues.buyer),
			recipient: sectionOrDefault(parsed?.recipient, checkoutDefaultValues.recipient),
			address: sectionOrDefault(parsed?.address, checkoutDefaultValues.address),
			location: sectionOrDefault(parsed?.location, checkoutDefaultValues.location),
			references: sectionOrDefault(parsed?.references, checkoutDefaultValues.references),
			delivery: sectionOrDefault(parsed?.delivery, checkoutDefaultValues.delivery),
			instructions: sectionOrDefault(parsed?.instructions, checkoutDefaultValues.instructions),
			payment: sectionOrDefault(parsed?.payment, checkoutDefaultValues.payment),
			consent: sectionOrDefault(parsed?.consent, checkoutDefaultValues.consent),
		};
	} catch {
		return checkoutDefaultValues;
	}
};

export const CheckoutPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const items = useCartStore(state => state.items);
	const hasHydrated = useCartStore(state => state.hasHydrated);
	const setDeliveryCost = useCartStore(state => state.setDeliveryCost);
	const cleanCart = useCartStore(state => state.cleanCart);

	const methods = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutFormSchema),
		defaultValues: loadDraft(),
		mode: 'onTouched',
	});
	const { control, trigger, handleSubmit, watch } = methods;

	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [furthestStepIndex, setFurthestStepIndex] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const currentStep = CHECKOUT_STEPS[currentStepIndex];
	const isLastStep = currentStepIndex === CHECKOUT_STEPS.length - 1;

	// Conservación temporal del formulario: se guarda en sessionStorage (no
	// localStorage) porque es un borrador de la sesión de compra actual, no
	// datos que deban sobrevivir entre visitas distintas.
	useEffect(() => {
		const subscription = watch(values => {
			sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
		});
		return () => subscription.unsubscribe();
	}, [watch]);

	const modality = useWatch({ control, name: 'delivery.modality' });

	useEffect(() => {
		const cost = DELIVERY_MODALITY_OPTIONS.find(option => option.value === modality)?.cost ?? 0;
		setDeliveryCost(cost);
	}, [modality, setDeliveryCost]);

	const goToStep = (index: number) => {
		if (index < 0 || index > furthestStepIndex) return;
		setCurrentStepIndex(index);
	};

	const goToStepId = (stepId: CheckoutStepId) => {
		const index = CHECKOUT_STEPS.findIndex(step => step.id === stepId);
		if (index >= 0) setCurrentStepIndex(index);
	};

	// Los combos no son "productos" reales para el backend (api/order solo
	// acepta ProductId de ProductEntity, ver CreateOrderEntityCommandHandler):
	// expandir un combo en sus productos y cobrar el precio individual de
	// cada uno sobrecargaría al cliente frente al precio propio del combo.
	// Hasta que el backend soporte líneas de combo en el pedido, se bloquea
	// el envío en vez de cobrar de más o fallar con un error críptico del 400.
	const comboItemsInCart = items.filter(item => item.comboId);

	const onSubmit = async (data: CheckoutFormValues) => {
		if (isSubmitting || !user) return;

		if (comboItemsInCart.length > 0) {
			setSubmitError(
				'Los combos todavía no se pueden pagar por este checkout. Quítalos del carrito para continuar (los productos sueltos sí se pueden comprar).'
			);
			return;
		}

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const order = await createOrder({
				customerId: user.id,
				addressLine1: data.address.addressLine1,
				addressLine2: data.address.addressLine2,
				provinceId: data.location.provinceId,
				municipality: data.location.municipality,
				items: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
			});

			sessionStorage.removeItem(DRAFT_STORAGE_KEY);
			cleanCart();
			navigate(`/pedido-confirmado/${order.id}`, { state: { paymentMethod: data.payment.method } });
		} catch (error) {
			setSubmitError(
				error instanceof Error ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleNext = async () => {
		const isValid = await trigger(STEP_SCHEMA_KEY[currentStep.id]);
		if (!isValid) return;

		if (isLastStep) {
			await handleSubmit(onSubmit)();
			return;
		}

		const nextIndex = currentStepIndex + 1;
		setCurrentStepIndex(nextIndex);
		setFurthestStepIndex(current => Math.max(current, nextIndex));
	};

	const handleBack = () => {
		if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
	};

	const renderStep = () => {
		switch (currentStep.id) {
			case 'buyer':
				return <BuyerStep />;
			case 'recipient':
				return <RecipientStep />;
			case 'address':
				return <AddressStep />;
			case 'location':
				return <LocationStep />;
			case 'references':
				return <ReferencesStep />;
			case 'delivery':
				return <DeliveryModalityStep />;
			case 'instructions':
				return <InstructionsStep />;
			case 'review':
				return <ReviewStep onEditStep={goToStepId} />;
			case 'payment':
				return <PaymentStep />;
			default:
				return null;
		}
	};

	return (
		<div className='flex min-h-screen flex-col bg-neutral-50'>
			<header className='border-b border-neutral-200 bg-white py-4'>
				<div className='container flex items-center justify-between'>
					<Logo />
					<span className='inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500'>
						<FiLock aria-hidden='true' />
						Pago seguro
					</span>
				</div>
			</header>

			<main className='container flex-1 py-8'>
				{!hasHydrated ? (
					<div className='flex flex-col gap-6'>
						<Skeleton className='h-6 w-64' />
						<div className='grid gap-8 lg:grid-cols-3'>
							<Skeleton className='h-96 rounded-2xl lg:col-span-2' />
							<Skeleton className='h-64 rounded-2xl' />
						</div>
					</div>
				) : items.length === 0 ? (
					<EmptyState
						icon={<FiShoppingBag />}
						title='Tu carrito está vacío'
						description='Agrega productos desde el catálogo antes de iniciar el checkout.'
						action={
							<Link to='/catalogo'>
								<Button>Ir al catálogo</Button>
							</Link>
						}
					/>
				) : (
					<FormProvider {...methods}>
						<form
							noValidate
							onKeyDown={event => {
								if (event.key === 'Enter' && !isLastStep) event.preventDefault();
							}}
							onSubmit={handleSubmit(onSubmit)}
							className='flex flex-col gap-6'
						>
							<CheckoutStepper
								steps={CHECKOUT_STEPS}
								currentIndex={currentStepIndex}
								furthestIndex={furthestStepIndex}
								onStepSelect={goToStep}
							/>

							<div className='grid gap-8 lg:grid-cols-3'>
								<div className='flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2 sm:p-6'>
									<h1 className='text-lg font-bold text-neutral-900'>{currentStep.title}</h1>

									{renderStep()}

									{submitError && (
										<Alert variant='danger' title='No pudimos procesar tu pedido'>
											{submitError}
										</Alert>
									)}

									<div className='flex items-center justify-between border-t border-neutral-200 pt-4'>
										<Button
											type='button'
											variant='outline'
											onClick={handleBack}
											disabled={currentStepIndex === 0 || isSubmitting}
										>
											Anterior
										</Button>

										<Button type='button' onClick={handleNext} isLoading={isSubmitting}>
											{isLastStep ? 'Confirmar y pagar' : 'Siguiente'}
										</Button>
									</div>
								</div>

								<div className='lg:col-span-1'>
									<CheckoutOrderSummary />
								</div>
							</div>
						</form>
					</FormProvider>
				)}
			</main>
		</div>
	);
};
