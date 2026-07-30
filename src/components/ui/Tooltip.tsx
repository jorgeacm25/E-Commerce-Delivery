import { cloneElement, useId, useState } from 'react';
import { cn } from '../../helpers';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface Props {
	content: string;
	position?: TooltipPosition;
	children: React.ReactElement;
}

const positionClasses: Record<TooltipPosition, string> = {
	top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
	bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
	left: 'right-full top-1/2 -translate-y-1/2 mr-2',
	right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export const Tooltip = ({ content, position = 'top', children }: Props) => {
	const [isVisible, setIsVisible] = useState(false);
	const tooltipId = useId();

	return (
		<span
			className='relative inline-flex'
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
			onFocus={() => setIsVisible(true)}
			onBlur={() => setIsVisible(false)}
		>
			{cloneElement(children, { 'aria-describedby': tooltipId } as Record<string, unknown>)}

			{isVisible && (
				<span
					id={tooltipId}
					role='tooltip'
					className={cn(
						'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-popover animate-fade-in',
						positionClasses[position]
					)}
				>
					{content}
				</span>
			)}
		</span>
	);
};
