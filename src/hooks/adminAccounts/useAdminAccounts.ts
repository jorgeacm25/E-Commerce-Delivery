import { useQuery } from '@tanstack/react-query';
import { getAdminAccounts } from '../../services/adminAccounts.service';

// Solo cuentas Admin raíz deberían listar/crear otras cuentas (ver
// AdminSettingsPage, que llama esto con enabled: profile?.accountType ===
// 'admin') — se deja el flag explícito acá para no depender de que cada
// consumidor recuerde apagarlo.
export const useAdminAccounts = (enabled = true) => {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['admin-accounts'],
		queryFn: getAdminAccounts,
		enabled,
		retry: 1,
	});

	return { accounts: data ?? [], isLoading, isError };
};
