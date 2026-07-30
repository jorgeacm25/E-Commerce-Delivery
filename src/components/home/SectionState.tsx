import { ReactNode } from 'react';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

interface Props {
	isLoading: boolean;
	isError: boolean;
	isEmpty: boolean;
	onRetry?: () => void;
	loadingFallback: ReactNode;
	emptyTitle: string;
	emptyDescription?: string;
	errorDescription?: string;
	children: ReactNode;
}

// Encapsula el patrón loading/error/empty compartido por las secciones de la
// página de inicio que consumen datos vía TanStack Query.
export const SectionState = ({
	isLoading,
	isError,
	isEmpty,
	onRetry,
	loadingFallback,
	emptyTitle,
	emptyDescription,
	errorDescription,
	children,
}: Props) => {
	if (isLoading) return <>{loadingFallback}</>;

	if (isError) {
		return (
			<ErrorState
				description={errorDescription ?? 'No pudimos cargar esta sección. Inténtalo de nuevo.'}
				onRetry={onRetry}
			/>
		);
	}

	if (isEmpty) {
		return <EmptyState title={emptyTitle} description={emptyDescription} />;
	}

	return <>{children}</>;
};
