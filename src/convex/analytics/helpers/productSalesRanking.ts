// TYPES
import type { Doc, Id } from '../../_generated/dataModel.js';

export const TOP_PRODUCTS_LIMIT = 10;
export const MAX_PRODUCT_SALES_ROWS = 30_000;

export type ProductSalesTotals = Map<Id<'products'>, { revenue: number; quantity: number }>;

export function collectProductSalesTotals(rows: Doc<'dailyProductSales'>[]): ProductSalesTotals {
	const totals: ProductSalesTotals = new Map();

	for (const row of rows) {
		const existing = totals.get(row.productId);

		if (existing) {
			existing.revenue += row.revenue;
			existing.quantity += row.quantity;
		} else {
			totals.set(row.productId, { revenue: row.revenue, quantity: row.quantity });
		}
	}

	return totals;
}

export function mergeProductSalesTotals(
	target: ProductSalesTotals,
	source: ProductSalesTotals
): void {
	for (const [productId, totals] of source) {
		const existing = target.get(productId);

		if (existing) {
			existing.revenue += totals.revenue;
			existing.quantity += totals.quantity;
		} else {
			target.set(productId, { revenue: totals.revenue, quantity: totals.quantity });
		}
	}
}

export function productSalesTotalsFromEntries(
	entries: Array<{ productId: Id<'products'>; revenue: number; quantity: number }>
): ProductSalesTotals {
	const totals: ProductSalesTotals = new Map();

	for (const entry of entries) {
		totals.set(entry.productId, { revenue: entry.revenue, quantity: entry.quantity });
	}

	return totals;
}

export function productSalesTotalsToEntries(totals: ProductSalesTotals): Array<{
	productId: Id<'products'>;
	revenue: number;
	quantity: number;
}> {
	return [...totals].map(([productId, value]) => ({
		productId,
		revenue: value.revenue,
		quantity: value.quantity
	}));
}

export function rankProductSalesTotals(
	totals: ProductSalesTotals,
	limit = TOP_PRODUCTS_LIMIT
): Array<{ productId: Id<'products'>; revenue: number; quantity: number }> {
	return productSalesTotalsToEntries(totals)
		.filter((entry) => entry.revenue > 0 || entry.quantity > 0)
		.sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity)
		.slice(0, limit);
}
