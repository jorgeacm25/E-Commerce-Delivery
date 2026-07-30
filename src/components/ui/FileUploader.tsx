import { useId, useRef, useState } from 'react';
import { FiFile, FiUploadCloud, FiX } from 'react-icons/fi';
import { cn } from '../../helpers';

interface Props {
	label?: string;
	accept?: string;
	hint?: string;
	error?: string;
	file: File | null;
	onFileSelect: (file: File | null) => void;
	className?: string;
}

export const FileUploader = ({
	label,
	accept,
	hint,
	error,
	file,
	onFileSelect,
	className,
}: Props) => {
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();

	const handleFiles = (files: FileList | null) => {
		onFileSelect(files?.[0] ?? null);
	};

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			{label && (
				<label htmlFor={inputId} className='text-sm font-medium text-neutral-800'>
					{label}
				</label>
			)}

			<div
				onClick={() => inputRef.current?.click()}
				onDragOver={e => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={e => {
					e.preventDefault();
					setIsDragging(false);
					handleFiles(e.dataTransfer.files);
				}}
				role='button'
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
				}}
				className={cn(
					'focus-ring flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
					isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-neutral-400',
					error && 'border-danger-500'
				)}
			>
				<input
					ref={inputRef}
					id={inputId}
					type='file'
					accept={accept}
					onChange={e => handleFiles(e.target.files)}
					className='sr-only'
				/>

				{file ? (
					<div className='flex items-center gap-2 text-sm font-medium text-neutral-800'>
						<FiFile aria-hidden='true' />
						{file.name}
						<button
							type='button'
							aria-label='Quitar archivo'
							onClick={e => {
								e.stopPropagation();
								onFileSelect(null);
							}}
							className='focus-ring rounded p-0.5 text-neutral-400 hover:text-danger-600'
						>
							<FiX />
						</button>
					</div>
				) : (
					<>
						<FiUploadCloud className='text-2xl text-neutral-400' aria-hidden='true' />
						<p className='text-sm text-neutral-600'>
							Arrastra un archivo o <span className='font-medium text-primary-600'>selecciónalo</span>
						</p>
					</>
				)}
			</div>

			{error ? (
				<p className='text-xs font-medium text-danger-600' role='alert'>
					{error}
				</p>
			) : hint ? (
				<p className='text-xs text-neutral-500'>{hint}</p>
			) : null}
		</div>
	);
};
