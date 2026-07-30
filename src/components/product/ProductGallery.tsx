import { useState } from 'react';
import { cn } from '../../helpers';

interface Props {
	images: string[];
	alt: string;
}

export const ProductGallery = ({ images, alt }: Props) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const activeImage = images[activeIndex] ?? images[0];

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex aspect-square items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-6'>
				<img src={activeImage} alt={alt} className='h-full w-full object-contain' />
			</div>

			{images.length > 1 && (
				<div className='flex gap-2'>
					{images.map((image, index) => (
						<button
							key={index}
							type='button'
							onClick={() => setActiveIndex(index)}
							aria-label={`Ver imagen ${index + 1} de ${alt}`}
							aria-current={index === activeIndex}
							className={cn(
								'focus-ring flex h-16 w-16 items-center justify-center rounded-xl border p-1.5 transition-colors',
								index === activeIndex
									? 'border-primary-600'
									: 'border-neutral-200 hover:border-neutral-400'
							)}
						>
							<img
								src={image}
								alt=''
								aria-hidden='true'
								className='h-full w-full object-contain'
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
};
