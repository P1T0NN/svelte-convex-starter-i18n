// HELPERS
import { estimateBuyerCount, fromStoredBuyerSketch, mergeBuyerSketches } from './buyerSketch.js';
import { readDailySalesRows } from './dailySalesRange.js';

// TYPES
import type { QueryCtx } from '../../_generated/server.js';
import type { DashboardStats } from '../../../shared/features/analytics/types/analyticsTypes.js';

export async function getDashboardStats(
	ctx: QueryCtx,
	bounds: { from: number; to: number }
): Promise<DashboardStats> {
	const rows = await readDailySalesRows(ctx, bounds);

	let revenue = 0;
	let orders = 0;
	let paidOrders = 0;
	const sketches: Uint8Array[] = [];

	for (const row of rows) {
		revenue += row.revenue;
		orders += row.orders;
		paidOrders += row.paidOrders;
		sketches.push(fromStoredBuyerSketch(row.buyersSketch));
	}

	const customers = sketches.length > 0 ? estimateBuyerCount(mergeBuyerSketches(sketches)) : 0;

	return {
		revenue,
		orders,
		customers,
		averageOrderValue: paidOrders > 0 ? Math.round(revenue / paidOrders) : 0
	};
}
