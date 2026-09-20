// LIBRARIES
import { v } from 'convex/values';

// BUILDERS
import { adminQuery } from '../../builders/convexFunctionBuilders.js';

// CONFIG
import { MAX_RANGE_DAYS } from '../../../shared/features/analytics/config.js';

// HELPERS
import { assertDateRange } from '../helpers/assertDateRange.js';
import { DAY_IN_MS, readDailySalesRows, toUtcDay } from '../helpers/dailySalesRange.js';

// VALIDATORS
import { revenueSeries } from '../validators/analyticsValidators.js';

// TYPES
import type { RevenuePoint } from '../../../shared/features/analytics/types/analyticsTypes.js';

export const fetchRevenueSeries = adminQuery({
	args: {
		from: v.number(),
		to: v.number()
	},
	returns: revenueSeries,
	handler: async (ctx, args): Promise<RevenuePoint[]> => {
		assertDateRange(args);

		if ((args.to - args.from) / DAY_IN_MS > MAX_RANGE_DAYS) {
			throw new Error('Invalid dashboard date range');
		}

		const rows = await readDailySalesRows(ctx, args);
		const revenueByDay = new Map<number, number>();

		for (const row of rows) {
			revenueByDay.set(row.day, (revenueByDay.get(row.day) ?? 0) + row.revenue);
		}

		const series: RevenuePoint[] = [];

		for (let day = toUtcDay(args.from); day <= toUtcDay(args.to); day += DAY_IN_MS) {
			series.push({ date: day, revenue: revenueByDay.get(day) ?? 0 });
		}

		return series;
	}
});
