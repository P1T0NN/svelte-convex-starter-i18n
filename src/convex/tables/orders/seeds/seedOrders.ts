// LIBRARIES
import { v } from 'convex/values';

// SERVER
import { internalAction } from '../../../_generated/server.js';

// GENERATED
import { internal } from '../../../_generated/api.js';

// SEEDS
import { DAY_IN_MS, ORDER_SEED, SPREAD_DAYS } from './seedOrdersBatches.js';

const DAYS_PER_BATCH = 20;

export const seedOrders = internalAction({
	args: {},
	returns: v.object({
		inserted: v.number(),
		deleted: v.number(),
		products: v.number(),
		items: v.number()
	}),
	handler: async (
		ctx
	): Promise<{
		inserted: number;
		deleted: number;
		products: number;
		items: number;
	}> => {
		let deleted = 0;

		for (;;) {
			const result = await ctx.runMutation(
				internal.tables.orders.seeds.seedOrdersBatches.deleteOrderItemsBatch,
				{}
			);
			deleted += result.deleted;
			if (result.isDone) break;
		}

		for (;;) {
			const result = await ctx.runMutation(
				internal.tables.orders.seeds.seedOrdersBatches.deleteOrdersBatch,
				{}
			);
			deleted += result.deleted;
			if (result.isDone) break;
		}

		for (;;) {
			const result = await ctx.runMutation(
				internal.tables.orders.seeds.seedOrdersBatches.deleteProductsBatch,
				{}
			);
			deleted += result.deleted;
			if (result.isDone) break;
		}

		const productIds = await ctx.runMutation(
			internal.tables.orders.seeds.seedOrdersBatches.insertProductsBatch,
			{}
		);

		const todayStart = new Date(Date.now()).setHours(0, 0, 0, 0);
		const firstDay = todayStart - (SPREAD_DAYS - 1) * DAY_IN_MS;
		let randomState = ORDER_SEED;
		let inserted = 0;
		let items = 0;

		for (let day = firstDay; day <= todayStart; day += DAYS_PER_BATCH * DAY_IN_MS) {
			const result = await ctx.runMutation(
				internal.tables.orders.seeds.seedOrdersBatches.insertOrderDaysBatch,
				{
					fromDay: day,
					dayCount: DAYS_PER_BATCH,
					randomState,
					inserted,
					items,
					productIds
				}
			);

			randomState = result.randomState;
			inserted = result.inserted;
			items = result.items;
		}

		return { inserted, deleted, products: productIds.length, items };
	}
});
