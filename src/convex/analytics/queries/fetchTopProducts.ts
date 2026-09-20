// LIBRARIES
import { v } from 'convex/values';

// BUILDERS
import { adminQuery } from '../../builders/convexFunctionBuilders.js';

// CONFIG
import { MAX_RANGE_DAYS } from '../../../shared/features/analytics/config.js';

// HELPERS
import { assertDateRange } from '../helpers/assertDateRange.js';
import { DAY_IN_MS, toUtcDay } from '../helpers/dailySalesRange.js';
import {
	collectProductSalesTotals,
	MAX_PRODUCT_SALES_ROWS,
	rankProductSalesTotals
} from '../helpers/productSalesRanking.js';

// VALIDATORS
import { topProductsResult } from '../validators/analyticsValidators.js';

export const fetchTopProducts = adminQuery({
	args: {
		from: v.number(),
		to: v.number()
	},
	returns: topProductsResult,
	handler: async (ctx, args) => {
		assertDateRange(args);

		if ((args.to - args.from) / DAY_IN_MS > MAX_RANGE_DAYS) {
			throw new Error('Invalid dashboard date range');
		}

		const rows = await ctx.db
			.query('dailyProductSales')
			.withIndex('by_day_product_shard', (q) =>
				q.gte('day', toUtcDay(args.from)).lte('day', toUtcDay(args.to))
			)
			.take(MAX_PRODUCT_SALES_ROWS + 1);

		if (rows.length > MAX_PRODUCT_SALES_ROWS) {
			return { exact: false, products: [] };
		}

		const ranked = rankProductSalesTotals(collectProductSalesTotals(rows));
		const products = await Promise.all(
			ranked.map(async (entry) => {
				const product = await ctx.db.get(entry.productId);

				return {
					productId: entry.productId,
					name: product?.name ?? '',
					revenue: entry.revenue,
					quantity: entry.quantity
				};
			})
		);

		return { exact: true, products };
	}
});
