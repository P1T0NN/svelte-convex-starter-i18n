// HELPERS
import { DAY_IN_MS, toUtcDay } from '../analytics/helpers/dailySalesRange.js';
import { shardForOrder } from '../analytics/helpers/dailySalesShards.js';

// MIGRATIONS
import { migrations } from './migrations.js';

export const resetDailySales = migrations.define({
	table: 'dailySales',
	migrateOne: async (ctx, row) => {
		await ctx.db.delete(row._id);
	}
});

export const ensureDailySalesRows = migrations.define({
	table: 'orders',
	migrateOne: async (ctx, order) => {
		const day = toUtcDay(order.placedAt);
		const shard = shardForOrder(order._id);
		const existing = await ctx.db
			.query('dailySales')
			.withIndex('by_day_shard', (q) => q.eq('day', day).eq('shard', shard))
			.unique();
		if (existing) return;

		await ctx.db.insert('dailySales', {
			day,
			shard,
			orders: 0,
			paidOrders: 0,
			pendingOrders: 0,
			refundedOrders: 0,
			cancelledOrders: 0,
			revenue: 0
		});
	}
});

export const rebuildDailySales = migrations.define({
	table: 'dailySales',
	migrateOne: async (ctx, row) => {
		const orders = await ctx.db
			.query('orders')
			.withIndex('by_placed_at', (q) =>
				q.gte('placedAt', row.day).lt('placedAt', row.day + DAY_IN_MS)
			)
			.collect();

		let ordersInShard = 0;
		let revenue = 0;
		let paidOrders = 0;
		let pendingOrders = 0;
		let refundedOrders = 0;
		let cancelledOrders = 0;

		for (const order of orders) {
			if (shardForOrder(order._id) !== row.shard) continue;

			ordersInShard += 1;

			if (order.status === 'paid') {
				revenue += order.total;
				paidOrders += 1;
			} else if (order.status === 'pending') {
				pendingOrders += 1;
			} else if (order.status === 'refunded') {
				refundedOrders += 1;
			} else {
				cancelledOrders += 1;
			}
		}

		return {
			orders: ordersInShard,
			paidOrders,
			pendingOrders,
			refundedOrders,
			cancelledOrders,
			revenue
		};
	}
});
