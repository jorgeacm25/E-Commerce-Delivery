import { useQuery } from '@tanstack/react-query';
import { getPaymentProofs } from '../../services/paymentProofs.service';

// Cola de comprobantes pendientes (panel admin), contra el backend .NET
// real (api/paymentProof) — antes leía de Supabase, con `confirmPaymentProof`/
// `rejectPaymentProof` dependiendo de una sesión de Supabase Auth que esta
// app ya no crea (ver docs/PROJECT_STATE.md).
export const usePendingPaymentProofs = () => {
	const { data, isLoading } = useQuery({
		queryKey: ['payment-proofs', 'pending'],
		queryFn: getPaymentProofs,
		select: proofs => proofs.filter(proof => proof.estado === 'pendiente'),
		refetchInterval: 30_000, // refresca cada 30s: es la cola operativa del día a día
	});

	return { data, isLoading };
};
