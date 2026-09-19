// TYPES
import type { QueryCtx } from '../../_generated/server.js';
import type { DashboardStats } from '../../../shared/features/analytics/types/analyticsTypes.js';

export async function getDashboardStats(
	ctx: QueryCtx,
	bounds: { from: number; to: number }
): Promise<DashboardStats> {
	let revenue = 0;
	let paidOrders = 0;
	let orders = 0;

	const customers = new Set<string>();

	const rangedOrders = ctx.db
		.query('orders')
		.withIndex('by_placed_at', (q) => q.gte('placedAt', bounds.from).lte('placedAt', bounds.to));

	for await (const order of rangedOrders) {
		orders += 1;
		customers.add(order.customerId);

		if (order.status === 'paid') {
			revenue += order.total;
			paidOrders += 1;
		}
	}

	return {
		revenue,
		orders,
		customers: customers.size,
		averageOrderValue: paidOrders > 0 ? Math.round(revenue / paidOrders) : 0
	};
}
