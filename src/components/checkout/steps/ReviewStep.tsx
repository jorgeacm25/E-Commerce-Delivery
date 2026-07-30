import { Link } from 'react-router-dom';
import { useFormContext, useWatch } from 'react-hook-form';
import { DELIVERY_MODALITY_OPTIONS } from '../../../constants/checkout';
import { useDeliveryZones } from '../../../hooks';
import { CheckoutFormValues } from '../../../lib/checkoutValidators';
import { Checkbox } from '../../ui';
import { CheckoutStepId } from '../checkoutStepIds';

interface SummaryBlockProps {
	title: string;
	onEdit: () => void;
	children: React.ReactNode;
}

const SummaryBlock = ({ title, onEdit, children }: SummaryBlockProps) => (
	<div className='flex flex-col gap-1 rounded-xl border border-neutral-200 p-4'>
		<div className='flex items-center justify-between'>
			<h3 className='text-sm font-semibold text-neutral-900'>{title}</h3>
			<button
				type='button'
				onClick={onEdit}
				className='focus-ring rounded text-xs font-medium text-primary-600 hover:underline'
			>
				Editar
			</button>
		</div>
		<div className='text-sm text-neutral-600'>{children}</div>
	</div>
);

interface Props {
	onEditStep: (stepId: CheckoutStepId) => void;
}

// Revisión final antes de pagar: muestra lo capturado en los pasos
// anteriores con un enlace "Editar" por bloque (vuelve al paso
// correspondiente sin perder lo ya escrito) y el consentimiento de
// políticas, requerido para poder avanzar al pago.
export const ReviewStep = ({ onEditStep }: Props) => {
	const {
		control,
		register,
		formState: { errors },
	} = useFormContext<CheckoutFormValues>();

	const values = useWatch({ control });
	const { zones } = useDeliveryZones();

	const provinceLabel = zones.find(zone => zone.id === values.location?.provinceId)?.province;
	const modalityLabel = DELIVERY_MODALITY_OPTIONS.find(
		option => option.value === values.delivery?.modality
	)?.label;

	return (
		<div className='flex flex-col gap-4'>
			<p className='text-sm text-neutral-500'>
				Revisa que todo esté correcto antes de continuar al pago.
			</p>

			<SummaryBlock title='Comprador' onEdit={() => onEditStep('buyer')}>
				<p>{values.buyer?.fullName}</p>
				<p>{values.buyer?.email}</p>
				<p>
					{values.buyer?.phone} · {values.buyer?.country}
				</p>
			</SummaryBlock>

			<SummaryBlock title='Destinatario' onEdit={() => onEditStep('recipient')}>
				<p>{values.recipient?.fullName}</p>
				<p>{values.recipient?.phone}</p>
				{values.recipient?.relationship && <p>{values.recipient.relationship}</p>}
			</SummaryBlock>

			<SummaryBlock title='Dirección de entrega' onEdit={() => onEditStep('address')}>
				<p>{values.address?.addressLine1}</p>
				{values.address?.addressLine2 && <p>{values.address.addressLine2}</p>}
				<p>
					{values.location?.municipality}, {provinceLabel}
				</p>
			</SummaryBlock>

			<SummaryBlock title='Referencias' onEdit={() => onEditStep('references')}>
				<p>{values.references?.referencePoint}</p>
				{values.references?.alternatePhone && (
					<p>Teléfono alternativo: {values.references.alternatePhone}</p>
				)}
			</SummaryBlock>

			<SummaryBlock title='Entrega' onEdit={() => onEditStep('delivery')}>
				<p>{modalityLabel}</p>
			</SummaryBlock>

			<SummaryBlock title='Instrucciones especiales' onEdit={() => onEditStep('instructions')}>
				<p>{values.instructions?.specialInstructions || 'Sin instrucciones adicionales.'}</p>
			</SummaryBlock>

			<Checkbox
				label='Acepto las políticas de compra, entrega y reembolsos'
				description='Puedes leerlas en los enlaces del pie de página antes de aceptar.'
				error={errors.consent?.acceptPolicies?.message}
				{...register('consent.acceptPolicies')}
			/>

			<p className='text-xs text-neutral-500'>
				Al continuar aceptas nuestros{' '}
				<Link to='/politicas/terminos' target='_blank' className='font-medium text-primary-600 hover:underline'>
					términos y condiciones
				</Link>{' '}
				y nuestra{' '}
				<Link to='/politicas/privacidad' target='_blank' className='font-medium text-primary-600 hover:underline'>
					política de privacidad
				</Link>
				.
			</p>
		</div>
	);
};
