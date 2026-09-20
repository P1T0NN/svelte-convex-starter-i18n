// HELPERS
import { DAY_IN_MS, toUtcDay } from '../analytics/helpers/dailySalesRange.js';
import { shardForOrder } from '../analytics/helpers/dailySalesShards.js';

// MIGRATIONS
import { migrations } from './migrations.js';

export const resetDailyProductSales = migrations.define({
	table: 'dailyProductSales',
	migrateOne: async (ctx, row) => {
		await ctx.db.delete(row._id);
	}
});

export const ensureDailyProductSalesRows = migrations.define({
	table: 'orderItems',
	migrateOne: async (ctx, item) => {
		const order = await ctx.db.get(item.orderId);
		if (!order || order.status !== 'paid') return;

		const day = toUtcDay(order.placedAt);
		const shard = shardForOrder(order._id);
		const existing = await ctx.db
			.query('dailyProductSales')
			.withIndex('by_day_product_shard', (q) =>
				q.eq('day', day).eq('productId', item.productId).eq('shard', shard)
			)
			.unique();
		if (existing) return;

		await ctx.db.insert('dailyProductSales', {
			day,
			productId: item.productId,
			shard,
			quantity: 0,
			revenue: 0
		});
	}
});

export const rebuildDailyProductSales = migrations.define({
	table: 'dailyProductSales',
	migrateOne: async (ctx, row) => {
		const orders = await ctx.db
			.query('orders')
			.withIndex('by_placed_at', (q) =>
				q.gte('placedAt', row.day).lt('placedAt', row.day + DAY_IN_MS)
			)
			.collect();

		let quantity = 0;
		let revenue = 0;

		for (const order of orders) {
			if (order.status !== 'paid') continue;
			if (shardForOrder(order._id) !== row.shard) continue;

			const items = await ctx.db
				.query('orderItems')
				.withIndex('by_order_id', (q) => q.eq('orderId', order._id))
				.collect();

			for (const item of items) {
				if (item.productId !== row.productId) continue;
				quantity += item.quantity;
				revenue += item.lineTotalCents;
			}
		}

		return { quantity, revenue };
	}
});
