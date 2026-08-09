import Decimal from 'decimal.js';
import { apiFetch } from '../api/client';
import { CommissionResultDto, OrderResultDto, SellerResultDto } from '../api/types';
import { PerformanceSummary, SellerPerformance, TopProduct } from '../interfaces';

const sumUsd = (values: number[]): number =>
	values.reduce((acc, value) => acc.plus(new Decimal(value)), new Decimal(0)).toDecimalPlaces(2).toNumber();

export const getPerformanceSummary = async (): Promise<PerformanceSummary> => {
	const [orders, sellers, commissions] = await Promise.all([
		apiFetch<OrderResultDto[]>('/api/order'),
		apiFetch<SellerResultDto[]>('/api/seller'),
		apiFetch<CommissionResultDto[]>('/api/commission'),
	]);

	const validOrders = orders.filter(order => order.status !== 'Cancelled');
	const totalSalesUsd = sumUsd(validOrders.map(order => order.totalAmount ?? 0));
	const totalOrders = validOrders.length;
	const avgTicketUsd = totalOrders > 0 ? sumUsd([totalSalesUsd / totalOrders]) : 0;

	const productTotals = new Map<string, TopProduct>();
	validOrders.forEach(order => {
		(order.items ?? []).forEach(item => {
			const key = item.productId ?? item.productName ?? '';
			if (!key) return;
			const quantity = item.quantity ?? 0;
			const revenue = new Decimal(item.price ?? 0).times(quantity).toNumber();
			const existing = productTotals.get(key);
			if (existing) {
				existing.quantitySold += quantity;
				existing.revenueUsd = sumUsd([existing.revenueUsd, revenue]);
			} else {
				productTotals.set(key, {
					productId: item.productId ?? '',
					productName: item.productName ?? '—',
					quantitySold: quantity,
					revenueUsd: sumUsd([revenue]),
				});
			}
		});
	});

	const topProducts = Array.from(productTotals.values())
		.sort((a, b) => b.quantitySold - a.quantitySold)
		.slice(0, 5);

	const sellerPerformance: SellerPerformance[] = sellers
		.map((seller): SellerPerformance => {
			const sellerCommissions = commissions.filter(commission => commission.sellerId === seller.id);
			return {
				sellerId: seller.id ?? '',
				fullName: seller.fullName ?? '',
				totalCommissionUsd: sumUsd(sellerCommissions.map(c => c.amountUsd ?? 0)),
				pendingCommissionUsd: sumUsd(
					sellerCommissions.filter(c => c.status === 'Pending').map(c => c.amountUsd ?? 0)
				),
				settledCommissionUsd: sumUsd(
					sellerCommissions.filter(c => c.status === 'Settled').map(c => c.amountUsd ?? 0)
				),
			};
		})
		.sort((a, b) => b.totalCommissionUsd - a.totalCommissionUsd);

	return { totalSalesUsd, totalOrders, avgTicketUsd, topProducts, sellerPerformance };
};
