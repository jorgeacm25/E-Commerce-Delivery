import { useId, useMemo, useRef } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { cn } from '../../../helpers';

interface Props {
	images: (File | string)[];
	onChange: (images: (File | string)[]) => void;
	error?: string;
}

// FileUploader (src/components/ui/FileUploader.tsx) es de un solo archivo;
// un producto necesita varias imágenes, así que se construye un wrapper
// propio sobre un input múltiple en vez de forzar ese componente a un caso
// que no cubre.
export const ProductImagesUploader = ({ images, onChange, error }: Props) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();

	const previews = useMemo(
		() => images.map(image => (typeof image === 'string' ? image : URL.createObjectURL(image))),
		[images]
	);

	const handleFiles = (files: FileList | null) => {
		if (!files || files.length === 0) return;
		onChange([...images, ...Array.from(files)]);
	};

	const removeAt = (index: number) => {
		onChange(images.filter((_, i) => i !== index));
	};

	return (
		<div className='flex flex-col gap-2'>
			<label htmlFor={inputId} className='text-sm font-medium text-neutral-800'>
				Imágenes del producto
			</label>

			<div
				onClick={() => inputRef.current?.click()}
				role='button'
				tabIndex={0}
				onKeyDown={event => {
					if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
				}}
				className={cn(
					'focus-ring flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-6 text-center transition-colors',
					'border-neutral-300 hover:border-neutral-400',
					error && 'border-danger-500'
				)}
			>
				<input
					ref={inputRef}
					id={inputId}
					type='file'
					accept='image/*'
					multiple
					onChange={event => handleFiles(event.target.files)}
					className='sr-only'
				/>
				<FiUploadCloud className='text-2xl text-neutral-400' aria-hidden='true' />
				<p className='text-sm text-neutral-600'>
					Arrastra imágenes o <span className='font-medium text-primary-600'>selecciónalas</span>
				</p>
			</div>

			{previews.length > 0 && (
				<div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
					{previews.map((src, index) => (
						<div key={src + index} className='relative aspect-square overflow-hidden rounded-lg border border-neutral-200'>
							<img src={src} alt='' className='h-full w-full object-cover' />
							<button
								type='button'
								aria-label='Quitar imagen'
								onClick={event => {
									event.stopPropagation();
									removeAt(index);
								}}
								className='focus-ring absolute right-1 top-1 rounded-full bg-white/90 p-1 text-neutral-600 hover:text-danger-600'
							>
								<FiX size={14} />
							</button>
						</div>
					))}
				</div>
			)}

			{error && (
				<p className='text-xs font-medium text-danger-600' role='alert'>
					{error}
				</p>
			)}
		</div>
	);
};
