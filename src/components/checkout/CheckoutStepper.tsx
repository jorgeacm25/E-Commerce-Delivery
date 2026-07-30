import { FiCheck } from 'react-icons/fi';
import { cn } from '../../helpers';

export interface CheckoutStepInfo {
	id: string;
	title: string;
}

interface Props {
	steps: CheckoutStepInfo[];
	currentIndex: number;
	furthestIndex: number;
	onStepSelect: (index: number) => void;
}

// Indicador de progreso del checkout. En móvil se muestra como "Paso X de N"
// con barra de progreso (los círculos numerados no caben con comodidad); en
// escritorio se ve la lista completa de pasos. Solo se puede saltar a un
// paso ya alcanzado (furthestIndex), para no permitir avanzar sin validar.
export const CheckoutStepper = ({ steps, currentIndex, furthestIndex, onStepSelect }: Props) => {
	const current = steps[currentIndex];
	const progressPercent = ((currentIndex + 1) / steps.length) * 100;

	return (
		<nav aria-label='Progreso del checkout'>
			<div className='sm:hidden'>
				<p className='text-sm font-medium text-neutral-700'>
					Paso {currentIndex + 1} de {steps.length}: {current.title}
				</p>
				<div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200'>
					<div
						className='h-full rounded-full bg-primary-600 transition-all'
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
			</div>

			<ol className='hidden flex-wrap gap-x-1 gap-y-3 sm:flex'>
				{steps.map((step, index) => {
					const isCompleted = index < furthestIndex;
					const isCurrent = index === currentIndex;
					const isReachable = index <= furthestIndex;

					return (
						<li key={step.id} className='flex items-center'>
							<button
								type='button'
								disabled={!isReachable}
								aria-current={isCurrent ? 'step' : undefined}
								onClick={() => isReachable && onStepSelect(index)}
								className={cn(
									'focus-ring flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
									isCurrent && 'bg-primary-50 text-primary-700',
									!isCurrent && isCompleted && 'text-success-700 hover:bg-neutral-100',
									!isCurrent && !isCompleted && isReachable && 'text-neutral-600 hover:bg-neutral-100',
									!isReachable && 'cursor-not-allowed text-neutral-300'
								)}
							>
								<span
									className={cn(
										'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
										isCurrent && 'bg-primary-600 text-white',
										!isCurrent && isCompleted && 'bg-success-600 text-white',
										!isCurrent && !isCompleted && 'bg-neutral-200 text-neutral-600'
									)}
								>
									{isCompleted ? <FiCheck aria-hidden='true' /> : index + 1}
								</span>
								{step.title}
							</button>

							{index < steps.length - 1 && (
								<span className='mx-1 h-px w-3 shrink-0 bg-neutral-200' aria-hidden='true' />
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};
