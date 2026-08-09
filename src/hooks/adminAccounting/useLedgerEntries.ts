import { useQuery } from '@tanstack/react-query';
import { getAccountingSummary, getLedgerEntries } from '../../services/adminAccounting.service';

export const useLedgerEntries = () => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-accounting', 'entries'],
		queryFn: getLedgerEntries,
		retry: 1,
	});

	const entries = data ?? [];
	const summary = getAccountingSummary(entries);

	return { entries, summary, isLoading, isError };
};
