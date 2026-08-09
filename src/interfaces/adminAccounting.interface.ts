// Fase H del roadmap (Contabilidad). No es una entidad propia completa: es
// una vista que agrega ventas (api/order), comisiones liquidadas
// (api/commission, status Settled), remesas (api/remittance) y gastos
// manuales (api/expense, única entidad nueva real de este módulo).
export type LedgerEntryType = 'venta' | 'comision' | 'remesa' | 'gasto';

export interface LedgerEntry {
	id: string;
	type: LedgerEntryType;
	description: string;
	amountUsd: number;
	date: string;
}

export interface AccountingSummary {
	salesUsd: number;
	settledCommissionsUsd: number;
	remittancesUsd: number;
	expensesUsd: number;
	balanceUsd: number;
}

export interface ExpenseInput {
	description: string;
	amountUsd: number;
	amountCup: number;
	category: string;
	date: string;
}
