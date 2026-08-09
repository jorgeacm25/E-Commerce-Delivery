import Decimal from 'decimal.js';
import { apiFetch } from '../api/client';
import { CommissionResultDto, ExpenseResultDto, OrderResultDto, RemittanceResultDto } from '../api/types';
import { AccountingSummary, ExpenseInput, LedgerEntry } from '../interfaces';
import { toUtcDateTime } from '../helpers';

// Libro contable: no hay un endpoint único de "movimientos" en el
// backend — se agregan 4 fuentes distintas (ventas, comisiones liquidadas,
// remesas, gastos) en el cliente, mismo enfoque pragmático que
// adminOrders.service.ts/adminCustomers.service.ts.
export const getLedgerEntries = async (): Promise<LedgerEntry[]> => {
	const [orders, commissions, remittances, expenses] = await Promise.all([
		apiFetch<OrderResultDto[]>('/api/order'),
		apiFetch<CommissionResultDto[]>('/api/commission'),
		apiFetch<RemittanceResultDto[]>('/api/remittance'),
		apiFetch<ExpenseResultDto[]>('/api/expense'),
	]);

	const sales: LedgerEntry[] = orders
		.filter(order => order.status !== 'Cancelled')
		.map(order => ({
			id: `venta-${order.id}`,
			type: 'venta',
			description: `Pedido #${(order.id ?? '').slice(0, 8)}`,
			amountUsd: order.totalAmount ?? 0,
			date: order.createdAt ?? '',
		}));

	const settledCommissions: LedgerEntry[] = commissions
		.filter(commission => commission.status === 'Settled')
		.map(commission => ({
			id: `comision-${commission.id}`,
			type: 'comision',
			description: `Comisión liquidada - vendedor ${(commission.sellerId ?? '').slice(0, 8)}`,
			amountUsd: -(commission.amountUsd ?? 0),
			date: commission.settledAt ?? commission.createdAt ?? '',
		}));

	const remittanceEntries: LedgerEntry[] = remittances.map(remittance => ({
		id: `remesa-${remittance.id}`,
		type: 'remesa',
		description: `Remesa a ${remittance.recipientName ?? '—'}`,
		amountUsd: -(remittance.amountUsd ?? 0),
		date: remittance.createdAt ?? '',
	}));

	const expenseEntries: LedgerEntry[] = expenses.map(expense => ({
		id: `gasto-${expense.id}`,
		type: 'gasto',
		description: expense.description ?? '—',
		amountUsd: -(expense.amountUsd ?? 0),
		date: expense.date ?? expense.createdAt ?? '',
	}));

	return [...sales, ...settledCommissions, ...remittanceEntries, ...expenseEntries].sort((a, b) =>
		b.date.localeCompare(a.date)
	);
};

export const getAccountingSummary = (entries: LedgerEntry[]): AccountingSummary => {
	const sum = (type: LedgerEntry['type']) =>
		entries
			.filter(entry => entry.type === type)
			.reduce((acc, entry) => acc.plus(new Decimal(Math.abs(entry.amountUsd))), new Decimal(0))
			.toDecimalPlaces(2)
			.toNumber();

	const salesUsd = sum('venta');
	const settledCommissionsUsd = sum('comision');
	const remittancesUsd = sum('remesa');
	const expensesUsd = sum('gasto');

	const balanceUsd = new Decimal(salesUsd)
		.minus(settledCommissionsUsd)
		.minus(remittancesUsd)
		.minus(expensesUsd)
		.toDecimalPlaces(2)
		.toNumber();

	return { salesUsd, settledCommissionsUsd, remittancesUsd, expensesUsd, balanceUsd };
};

export const createExpense = async (input: ExpenseInput): Promise<void> => {
	await apiFetch('/api/expense', { method: 'POST', body: { ...input, date: toUtcDateTime(input.date) } });
};
